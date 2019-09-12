import React from 'react'
import constants from '../../../constants'
import { ActivityIndicator, AsyncStorage, Dimensions, Image, ImageBackground, Linking, Text, RefreshControl, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ButtonGroup, Divider, Button } from 'react-native-elements'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { Dropdown } from 'react-native-material-dropdown'
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import { AreaChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import moment from 'moment'
import * as rssParser from 'react-native-rss-parser';
import { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import style from '../../../style'


const LineGuarded = ({ line }) => (
    <Path
        key={'line'}
        d={line}
        stroke={'#faf549'}
        strokeWidth={3}
        fill={'none'}
    />
)

const LineCritical = ({ line }) => (
    <Path
        key={'line'}
        d={line}
        stroke={'#fb4969'}
        strokeWidth={3}
        fill={'none'}
    />
)

export default class Home extends React.Component {
    constructor() {
        super()
        this.state = {
            sliderWidth: Dimensions.get('window').width,
            activeSlide: 0,
            selectedIndex: 0,
            globalGuarded: [], globalCritical: [],
            refreshing: false,
            markers: [],
            location: {
                coords: {
                    latitude: 0,
                    longitude: 0,
                }
            },
            days: 30,
            showLabel: true,
            activeSector: 1,
            loading: true,
            rss: [{title: '', links: [{url: ''}, {url: ''}]}, {title: '', links: [{url: ''}, {url: ''}]}],
            tracksViewChanges: true,
            alertLevel: ''
        }
    }

    _onRefresh = () => {
        this.setState({ refreshing: true });
        this.fetchGraphData().then(() => {
            this.setState({ refreshing: false });
        })
    }
    componentDidMount() {
        this.fetchGraphData();
    }

    async fetchGraphData() {
        let email = await AsyncStorage.getItem('email')
        let token = await AsyncStorage.getItem('token')

        axios.get(`${constants.BASE_URL}/dashboard/risk/global?days=${90}`, { headers: { 'Authorization': token } })
            .then(resp => {
                // console.log('GLOBAL', resp)
                this.sortGlobalReports(resp.data.reportRiskGlobal)
            })
            .catch(err => console.log(err))

        axios.get(`${constants.BASE_URL}/dashboard/risk/sector?email=${email}&days=${90}`, { headers: { 'Authorization': token } })
            .then(resp => {
                // console.log('SECTOR', resp)
                this.sortSectorReports(resp.data.reportRiskSector)
            })
            .catch(err => console.log(err))

        axios.get(`${constants.BASE_URL}/dashboard/risk/profile?email=${email}&days=${90}`, { headers: { 'Authorization': token } })
            .then(resp => {
                // console.log('PROFILE', resp)
                this.sortProfileReports(resp.data.reportRiskProfile)
            })
            .catch(err => console.log(err))

        // Get threat level from CIS scraper
        axios.get(`${constants.BASE_URL}/scraper`, { headers: { 'Authorization': token } })
            .then(resp => {
                // console.log("HERE", resp)
                this.setState({
                    alertLevel: resp.data.alertLevel
                })
            })
            .catch(err => console.log(err))

        // Risk locations for map
        axios.get(`${constants.BASE_URL}/dashboard/risk/locations?days=${30}`, { headers: { 'Authorization': token } })
            .then(resp => {
                // console.log(resp.data)
                this.setState({ markers: resp.data.locationResults })
            })
            .catch(err => console.log(err))


        // RSS for tip of the day
        fetch('https://www.sans.org/tip-of-the-day/rss')
            .then((response) => response.text())
            .then((responseData) => rssParser.parse(responseData))
            .then((rss) => {
                // console.log(rss.items)
                this.setState({ rss: rss.items })
            });

        // if (Platform.OS === 'android' && Constants.isDevice) {

        //     this.setState({
        //         errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
        //     });
        // } else {
        this._getLocationAsync();
        // }
    }


    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let location = await Location.getCurrentPositionAsync({});
        if (Platform.OS !== "ios")
            console.log("Location android", location)


        this.setState({ location });

        // Seeded marker data

        let { latitude, longitude } = location.coords
        let markers = [{
            latlng: {
                latitude: latitude,
                longitude: longitude
            }
        }, {
            latlng: {
                latitude: latitude - .04,
                longitude: longitude - .02
            }
        }]

        this.setState({ markers })
    };

    sortGlobalReports(global) {
        // console.log("GLOBAL", global)
        let globalGuarded = []
        let globalCritical = []
        let now = moment()

        for (var i = 0; i < global.length; i++) {
            let m = now.diff(global[i].reportDate, 'days')
            global[i].reportDate = m

            if (global[i].reportRiskScore == 1.00) {
                globalGuarded.push(global[i])
            }
            else if (global[i].reportRiskScore == 2.00) {
                globalCritical.push(global[i])
            }
        }

        // Finds highest threat score to set boundaries for both graphs
        let max = Math.max.apply(Math, globalCritical.map(function (o) { return o.reportRiskCount; }))
        let min = Math.min.apply(Math, globalCritical.map(function (o) { return o.reportRiskCount; }))

        // Sort array by descending order of report dates
        // globalGuarded.sort(function (a, b) {
        //     return new Date(b.date) - new Date(a.date);
        // });
        // console.log("HERE", globalCritical)

        // Allows 10% range flexibility when checking whether or not to place marker point for values
        let range = (max - min) * .1

        // ?? May need to sort by descending dates 

        for (let i = 0; i < globalCritical.length; i++) {
            let obj = globalCritical[i]
            // obj['test'] = 6
            if (i >= 1) {
                let max = Math.max(globalCritical[i].reportRiskCount, globalCritical[i - 1].reportRiskCount)
                let min = Math.min(globalCritical[i].reportRiskCount, globalCritical[i - 1].reportRiskCount)
            }
        }


        let yMax = max
        this.setState({ globalGuarded, globalCritical, yMax, loading: false })
    }

    sortSectorReports(sector) {

        let sectorTypes = [];
        // Separate sectors into types
        for (let i = 0; i < sector.length; i++) {
            if (!sectorTypes.includes(sector[i].sectorDescription)) sectorTypes.push(sector[i].sectorDescription)
            else continue;
        }

        let sector1Critical = sector.filter(el => ((el.sectorDescription === sectorTypes[0]) && el.reportRiskScoreDesc === 'Critical'))
        let sector1Guarded = sector.filter(el => ((el.sectorDescription === sectorTypes[0]) && el.reportRiskScoreDesc === 'Guarded'))
        let sector2Critical = sector.filter(el => ((el.sectorDescription === sectorTypes[1]) && el.reportRiskScoreDesc === 'Critical'))
        let sector2Guarded = sector.filter(el => ((el.sectorDescription === sectorTypes[1]) && el.reportRiskScoreDesc === 'Guarded'))
        let sector3Critical = sector.filter(el => ((el.sectorDescription === sectorTypes[2]) && el.reportRiskScoreDesc === 'Critical'))
        let sector3Guarded = sector.filter(el => ((el.sectorDescription === sectorTypes[2]) && el.reportRiskScoreDesc === 'Guarded'))

        this.setState({ sectorTypes, sector1Critical, sector1Guarded, sector2Critical, sector2Guarded, sector3Critical, sector3Guarded })



        // console.log("Sector Data:", sectorTypes, sector1Critical, sector1Guarded, sector2Critical, sector2Guarded, sector3Critical, sector3Guarded)

        // console.log("sector", sector)
        let sectorGuarded = []
        let sectorCritical = []
        let now = moment()

        for (var i = 0; i < sector.length; i++) {
            let m = now.diff(sector[i].reportDate, 'days')
            sector[i].reportDate = m

            if (sector[i].reportRiskScore == 1.00) {
                sectorGuarded.push(sector[i])
            }
            else if (sector[i].reportRiskScore == 2.00) {
                sectorCritical.push(sector[i])
            }
        }

        // Finds highest threat score to set boundaries for both graphs
        let max = Math.max.apply(Math, sectorCritical.map(function (o) { return o.reportRiskCount; }))
        let min = Math.min.apply(Math, sectorCritical.map(function (o) { return o.reportRiskCount; }))

        // Sort array by descending order of report dates
        // sectorGuarded.sort(function (a, b) {
        //     return new Date(b.date) - new Date(a.date);
        // });
        // console.log("HERE", sectorCritical)

        // Allows 10% range flexibility when checking whether or not to place marker point for values
        let range = (max - min) * .1

        // ?? May need to sort by descending dates 

        for (let i = 0; i < sectorCritical.length; i++) {
            let obj = sectorCritical[i]
            // obj['test'] = 6
            if (i >= 1) {
                let max = Math.max(sectorCritical[i].reportRiskCount, sectorCritical[i - 1].reportRiskCount)
                let min = Math.min(sectorCritical[i].reportRiskCount, sectorCritical[i - 1].reportRiskCount)
            }
        }


        let yMaxSector = max
        this.setState({ sectorGuarded, sectorCritical, yMaxSector })
    }

    sortProfileReports(profile) {
        // console.log("PROFILE", profile)
        let profileGuarded = []
        let profileCritical = []
        let now = moment()

        for (var i = 0; i < profile.length; i++) {
            let m = now.diff(profile[i].reportDate, 'days')
            profile[i].reportDate = m

            if (profile[i].reportRiskScore == 1.00) {
                profileGuarded.push(profile[i])
            }
            else if (profile[i].reportRiskScore == 2.00) {
                profileCritical.push(profile[i])
            }
        }

        // Finds highest threat score to set boundaries for both graphs
        let max = Math.max.apply(Math, profileCritical.map(function (o) { return o.reportRiskCount; }))
        let min = Math.min.apply(Math, profileCritical.map(function (o) { return o.reportRiskCount; }))

        // Sort array by descending order of report dates
        // profileGuarded.sort(function (a, b) {
        //     return new Date(b.date) - new Date(a.date);
        // });
        // console.log("HERE", profileCritical)

        // Allows 10% range flexibility when checking whether or not to place marker point for values
        let range = (max - min) * .1

        // ?? May need to sort by descending dates 

        for (let i = 0; i < profileCritical.length; i++) {
            let obj = profileCritical[i]
            // obj['test'] = 6
            if (i >= 1) {
                let max = Math.max(profileCritical[i].reportRiskCount, profileCritical[i - 1].reportRiskCount)
                let min = Math.min(profileCritical[i].reportRiskCount, profileCritical[i - 1].reportRiskCount)
            }
        }


        let yMaxProfile = max
        this.setState({ profileGuarded, profileCritical, yMaxProfile })
    }


    updateIndex(selectedIndex) {
        this.setState({ selectedIndex })
    }

    daysHandler(value) {
        this.setState({ showLabel: false })
        if (value === 'Last 30 Days') this.setState({ days: 30 })
        else if (value === 'Last 60 Days') this.setState({ days: 60 })
        else if (value === 'Last 90 Days') this.setState({ days: 90 })
    }

    renderAlertLevel() {
        let alertLevel = this.state.alertLevel.toLowerCase()
        console.log("Threat alert level:", alertLevel)

        let src, desc

        switch (alertLevel) {
            case 'low': src = <Image style={{ width: 79, height: 20 }} source={require('../../../assets/images/threat-low.png')} />
                desc = <Text style={{ fontSize: 12 }}><Text style={{ color: '#73ae57', fontWeight: 'bold' }}>LOW </Text>indicates a low risk. No unusual activity exists beyond the normal concern for known hacking activities, known viruses, or other malicious activity.</Text>
                break;
            case 'guarded': src = <Image style={{ width: 79, height: 20 }} source={require('../../../assets/images/threat-guarded.png')} />
                desc = <Text style={{ fontSize: 12 }}><Text style={{ color: '#2c91b3', fontWeight: 'bold' }}>GUARDED </Text>indicates a general risk of increased hacking, virus, or other malicious activity.</Text>
                break;
            case 'elevated': src = <Image style={{ width: 79, height: 20 }} source={require('../../../assets/images/threat-elevated.png')} />
                desc = <Text style={{ fontSize: 12 }}><Text style={{ color: '#ecde29', fontWeight: 'bold' }}>ELEVATED </Text>indicates a significant risk due to increased hacking, virus, or other malicious activity that compromises systems or diminishes service.</Text>
                break;
            case 'high': src = <Image style={{ width: 79, height: 20 }} source={require('../../../assets/images/threat-high.png')} />
                desc = <Text style={{ fontSize: 12 }}><Text style={{ color: '#f37043', fontWeight: 'bold' }}>HIGH </Text>indicates a high risk of increased hacking, virus, or other malicious cyber activity that targets core/critical infrastructure to cause multiple service outages and system compromises.</Text>
                break;
            case 'severe': src = <Image style={{ width: 79, height: 20 }} source={require('../../../assets/images/threat-severe.png')} />
                desc = <Text style={{ fontSize: 12 }}><Text style={{ color: '#d0122f', fontWeight: 'bold' }}>SEVERE </Text>indicates a severe risk of hacking, virus, or other malicious activity resulting in widespread outages and/or significantly destructive compromises to systems or critical infrastructure sectors.</Text>

        }

        return (
            <View style={{ margin: 25, flex: 1, justifyContent: 'space-between' }}>
                <View>

                    <Text style={{ color: '#707992', fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Security State of Affairs</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={style.h3}>THREAT LEVEL</Text>
                        {src}
                    </View>
                </View>
                <Text>{desc}</Text>
            </View>
        )

    }

    renderItem({ item, index }) {
        console.log("ITEM", item)
        return (
            <TouchableOpacity onPress={() => this.state.alertLevel && this.props.navigation.navigate('RecommendationActions', { alertLevel: this.state.alertLevel })} style={{ flex: 1, justifyContent: 'space-evenly', alignItems: 'center' }}>
                {index == 0 ?
                    <ImageBackground source={item.src} style={{ width: '100%', height: 200 }}>
                        {this.renderAlertLevel()}
                    </ImageBackground>
                    :
                    <View style={{ justifyContent: 'space-around', width: '100%', height: 180, backgroundColor: '#313961', padding: 15, paddingHorizontal: 25 }}>
                        <Text style={{ color: '#f5bd00', fontSize: 10, fontWeight: '900' }}>TIP OF THE DAY</Text>
                        <Text style={{ fontSize: 17, fontWeight: 'bold' }}>{item.title}</Text>
                        <Text numberOfLines={4} style={{ fontSize: 13, opacity: .8 }}>{item.desc}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button onPress={() => Linking.openURL(item.link).catch((err) => console.log('An error occurred', err))} buttonStyle={[style.button, { width: 98, height: 25, padding: 0, margin: 0 }]} title='Read More ->' titleStyle={{ fontSize: 12, fontWeight: '900' }} />
                            <Text style={{ opacity: .25, fontSize: 10, fontWeight: 'bold' }}>{item.date}</Text>
                        </View>
                    </View>
                }
            </TouchableOpacity>
        )
    }

    renderSectorGraph() {
        const GradientGuarded = ({ index }) => (
            <Defs key={index}>
                <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
                    <Stop offset={'0%'} stopColor={'#faf549'} stopOpacity={0.6} />
                    <Stop offset={'100%'} stopColor={'#faf549'} stopOpacity={0} />
                </LinearGradient>
            </Defs>
        )

        const GradientCritical = ({ index }) => (
            <Defs key={index}>
                <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
                    <Stop offset={'0%'} stopColor={'#fb4969'} stopOpacity={0.6} />
                    <Stop offset={'100%'} stopColor={'#fb4969'} stopOpacity={0} />
                </LinearGradient>
            </Defs>
        )

        const PointsGuarded = ({ x, y, color }) => {
            let { days } = this.state

            // console.log("ACTIVE SECTOR", this.state.activeSector, this.state.sector2Guarded, this.state.sector3Guarded)
            let guarded = ''
            if (this.state.selectedIndex == 0) guarded = this.state.globalGuarded
            if (this.state.selectedIndex == 1 && this.state.activeSector == 1) guarded = this.state.sector1Guarded
            if (this.state.selectedIndex == 1 && this.state.activeSector == 2) guarded = this.state.sector2Guarded
            if (this.state.selectedIndex == 1 && this.state.activeSector == 3) guarded = this.state.sector3Guarded
            if (this.state.selectedIndex == 2) guarded = this.state.profileGuarded

            let divider;

            // Ensures a specific number of markers plotted
            if (days == 30) divider = 12
            else if (days == 60) divider = 8
            else if (days == 90) divider = 4

            let num = Math.floor(guarded.length / divider)

            let arr = []
            for (let i = 0; i < divider; i++) {
                arr.push(num * i)
            }

            return (
                guarded.map((item, index) => {
                    {
                        if (arr.includes(index)) {
                            return (
                                <Circle
                                    key={index}
                                    cx={x(moment(item.reportDate))}
                                    cy={y(item.reportRiskCount)}
                                    r={5}
                                    stroke='#faf549'
                                    strokeWidth={3}
                                    fill='#fff'
                                    onPress={() => this.setState({ tooltipX: moment(item.date), tooltipY: item.score, tooltipIndex: index })}
                                />
                            )
                        }
                    }
                }))
        }

        const PointsCritical = ({ x, y, color }) => {
            let { days } = this.state
            let critical = ''
            if (this.state.selectedIndex == 0) critical = this.state.globalCritical
            if (this.state.selectedIndex == 1 && this.state.activeSector == 1) critical = this.state.sector1Critical
            if (this.state.selectedIndex == 1 && this.state.activeSector == 2) critical = this.state.sector2Critical
            if (this.state.selectedIndex == 1 && this.state.activeSector == 3) critical = this.state.sector3Critical
            if (this.state.selectedIndex == 2) critical = this.state.profileCritical

            let divider;

            if (days == 30) divider = 12
            else if (days == 60) divider = 8
            else if (days == 90) divider = 4

            let num = Math.floor(critical.length / divider)

            let arr = []
            for (let i = 0; i < divider; i++) {
                arr.push(num * i)
            }

            return (
                critical.map((item, index) => {
                    {
                        if (arr.includes(index)) {
                            return (
                                <Circle
                                    key={index}
                                    cx={x(moment(item.reportDate))}
                                    cy={y(item.reportRiskCount)}
                                    r={5}
                                    stroke='#fb4969'
                                    strokeWidth={3}
                                    fill='#fff'
                                    onPress={() => this.setState({ tooltipX: moment(item.date), tooltipY: item.score, tooltipIndex: index })}
                                />
                            )
                        }
                    }
                }))
        }

        return (
            <View style={{ flex: 1, width: '85%', alignSelf: 'center' }}>
                <View style={{ flex: 1, height: 200, flexDirection: 'row', marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <YAxis
                        data={this.state.activeSector == 1 ? this.state.sector1Critical :
                            this.state.activeSector == 2 ? this.state.sector2Critical : this.state.sector3Critical}
                        yAccessor={({ item }) => item.reportRiskCount}
                        contentInset={{ top: 10, bottom: 25 }}
                        svg={{ fontSize: 12, fill: '#707992' }}
                        min={0}
                        numberOfTicks={5}
                        formatLabel={value => value}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <AreaChart
                            style={{ flex: 1 }}
                            data={this.state.activeSector == 1 ? this.state.sector1Guarded :
                                this.state.activeSector == 2 ? this.state.sector2Guarded : this.state.sector3Guarded}
                            yAccessor={({ item }) => item.reportRiskCount}
                            xAccessor={({ item }) => item.reportDate}
                            xMin={this.state.days} xMax={1}
                            yMin={0} yMax={this.state.selectedIndex == 0 ? this.state.yMax : this.state.selectedIndex == 1 ? this.state.yMaxSector : this.state.yMaxProfile}
                            contentInset={{ top: 10, bottom: 10 }}
                            curve={shape.curveCatmullRom}
                            svg={{ fill: 'url(#gradient)' }}
                        >
                            <Grid />
                            <LineGuarded />
                            <PointsGuarded />
                            <GradientGuarded />

                        </AreaChart>
                        <AreaChart
                            style={StyleSheet.absoluteFill}
                            data={this.state.activeSector == 1 ? this.state.sector1Critical :
                                this.state.activeSector == 2 ? this.state.sector2Critical : this.state.sector3Critical}
                            yAccessor={({ item }) => item.reportRiskCount}
                            xAccessor={({ item }) => item.reportDate}
                            xMin={this.state.days} xMax={1}
                            yMin={0} yMax={this.state.selectedIndex == 0 ? this.state.yMax : this.state.selectedIndex == 1 ? this.state.yMaxSector : this.state.yMaxProfile}
                            contentInset={{ top: 10, bottom: 10 }}
                            curve={shape.curveCatmullRom}
                            svg={{ fill: 'url(#gradient)' }}
                        >
                            <LineCritical />
                            <PointsCritical />
                            <GradientCritical />

                        </AreaChart>
                        <XAxis
                            data={this.state.activeSector == 1 ? this.state.sector1Guarded :
                                this.state.activeSector == 2 ? this.state.sector2Guarded : this.state.sector3Guarded}
                            xAccessor={({ item }) => item.reportDate}
                            svg={{ fontSize: 12, fill: '#707992' }}
                            contentInset={{ left: 10 }}
                            numberOfTicks={5}
                            min={this.state.days} max={1}
                            formatLabel={value => value + 'd'}
                        />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10, justifyContent: 'space-evenly', alignItems: 'flex-end', opacity: .8 }}>
                    <Text style={{ color: '#fb4969', fontWeight: 'bold', fontSize: 12 }}>• Critical</Text>
                    <Text style={{ color: '#faf549', fontWeight: 'bold', fontSize: 12 }}>• Guarded</Text>
                </View>
                <Text style={[style.h5, { alignSelf: 'center' }]}>{this.state.sectorTypes[this.state.activeSector - 1]}</Text>
            </View >
        )
    }

    render() {

        // ?
        if (this.state.globalGuarded.length > 0) this.state.globalGuarded[1].reportRiskCount = 40

        console.log("RSS", this.state.rss[1])

        const entries = [
            {
                title: 'THREAT SCORE',
                src: require('../../../assets/images/threat-bg.png'),
                desc: 'Send suspicious emails to LA Cyber Lab'
            },
            {
                title: this.state.rss[0].title,
                desc: this.state.rss[0].description,
                link: this.state.rss[0].links[0].url,
                date: moment(this.state.rss[0].published).format('ll').toUpperCase()
            },
            {
                title: this.state.rss[1].title,
                desc: this.state.rss[1].description,
                link: this.state.rss[1].links[0].url,
                date: moment(this.state.rss[1].published).format('ll').toUpperCase()
            },
        ]
        



        const buttons = ['GLOBAL', 'INDUSTRY', 'PERSONAL']

        const GradientGuarded = ({ index }) => (
            <Defs key={index}>
                <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
                    <Stop offset={'0%'} stopColor={'#faf549'} stopOpacity={0.6} />
                    <Stop offset={'100%'} stopColor={'#faf549'} stopOpacity={0} />
                </LinearGradient>
            </Defs>
        )

        const GradientCritical = ({ index }) => (
            <Defs key={index}>
                <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
                    <Stop offset={'0%'} stopColor={'#fb4969'} stopOpacity={0.6} />
                    <Stop offset={'100%'} stopColor={'#fb4969'} stopOpacity={0} />
                </LinearGradient>
            </Defs>
        )

        const PointsGuarded = ({ x, y, color }) => {
            let { days } = this.state

            let guarded = ''
            if (this.state.selectedIndex == 0) guarded = this.state.globalGuarded
            if (this.state.selectedIndex == 1) guarded = this.state.sectorGuarded
            if (this.state.selectedIndex == 2) guarded = this.state.profileGuarded

            let divider;

            if (days == 30) divider = 12
            else if (days == 60) divider = 8
            else if (days == 90) divider = 4

            let num = Math.floor(guarded.length / divider)

            let arr = []
            for (let i = 0; i < divider; i++) {
                arr.push(num * i)
            }

            return (
                guarded.map((item, index) => {
                    {
                        if (arr.includes(index)) {
                            return (

                                <Circle
                                    key={index}
                                    cx={x(moment(item.reportDate))}
                                    cy={y(item.reportRiskCount)}
                                    r={5}
                                    stroke='#faf549'
                                    strokeWidth={3}
                                    fill='#fff'
                                    onPress={() => this.setState({ tooltipX: moment(item.date), tooltipY: item.score, tooltipIndex: index })}
                                >
                                    {/* {console.log("CIRCLE", x, y, index, item.reportDate, item.reportRiskCount)} */}
                                </Circle>
                            )
                        }
                    }
                }))
        }

        const PointsCritical = ({ x, y, color }) => {
            let { days } = this.state

            let critical = ''
            if (this.state.selectedIndex == 0) critical = this.state.globalCritical
            if (this.state.selectedIndex == 1) critical = this.state.sectorGuarded
            if (this.state.selectedIndex == 2) critical = this.state.profileCritical

            let divider;

            if (days == 30) divider = 12
            else if (days == 60) divider = 8
            else if (days == 90) divider = 4

            let num = Math.floor(critical.length / divider)

            let arr = []
            for (let i = 0; i < divider; i++) {
                arr.push(num * i)
            }

            return (
                critical.map((item, index) => {
                    {
                        if (arr.includes(index)) {
                            return (
                                <Circle
                                    key={index}
                                    cx={x(moment(item.reportDate))}
                                    cy={y(item.reportRiskCount)}
                                    r={5}
                                    stroke='#fb4969'
                                    strokeWidth={3}
                                    fill='#fff'
                                    onPress={() => this.setState({ tooltipX: moment(item.date), tooltipY: item.score, tooltipIndex: index })}
                                />
                            )
                        }
                    }
                }))
        }

        const mapFilter = [{
            value: 'Last 30 Days'
        }, {
            value: 'Last 60 Days'
        }, {
            value: 'Last 90 Days',
        }]

        return (

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                    />
                }>
                <View style={[style.body, { paddingTop: 0 }]}>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={style.h1}>LA Cyber Lab</Text>
                        <Icon name='bell' color='#fff' size={30} />
                    </View>

                    <View style={[style.body, { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 0 }]}>
                        <Carousel
                            ref={ref => this.carouselRef = ref}
                            data={entries}
                            renderItem={this.renderItem.bind(this)}
                            sliderWidth={this.state.sliderWidth}
                            onSnapToItem={index => this.setState({ activeSlide: index })}
                            itemWidth={this.state.sliderWidth * .9}
                        // inactiveSlideOpacity={0}
                        // inactiveSlideScale={0.75}
                        />
                        <Pagination
                            dotsLength={entries.length}
                            activeDotIndex={this.state.activeSlide}
                            dotStyle={{
                                width: 7,
                                height: 7,
                                borderRadius: 5,
                                backgroundColor: '#fa4969'
                            }}
                            containerStyle={{ paddingTop: 15, paddingBottom: 10 }}


                            dotContainerStyle={{ marginHorizontal: 2 }}
                            tappableDots={!!this.carouselRef}
                            carouselRef={this.carouselRef}
                            inactiveDotStyle={{ backgroundColor: '#575a6f' }}
                            inactiveDotScale={1}
                            inactiveDotOpacity={1}
                        />
                    </View >

                    <Divider style={{ height: 1, backgroundColor: '#737589', marginVertical: 20 }} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={style.h2}>Threat Trend</Text>
                        {/* <View style={{alignItems: 'center', justifyContent: 'center', alignSelf: 'center'}}> */}
                        <Dropdown
                            label={this.state.showLabel && 'Last 30 Days'}
                            data={mapFilter}
                            baseColor='#fff'
                            textColor='#fff'
                            itemColor='#fff'
                            selectedItemColor='#fff'
                            fontSize={12}
                            itemPadding={6}
                            containerStyle={{ marginTop: -20, width: 100, justifyContent: 'center' }}
                            overlayStyle={{ justifyContent: 'center', alignItems: 'center' }}
                            pickerStyle={{ backgroundColor: '#6e7892', borderRadius: 7, justifyContent: 'center', alignItems: 'center' }}
                            onChangeText={value => this.daysHandler(value)}
                        />
                        {/* </View> */}
                    </View>

                    <ButtonGroup
                        onPress={this.updateIndex.bind(this)}
                        selectedIndex={this.state.selectedIndex}
                        buttons={buttons}
                        innerBorderStyle={{ width: 0 }}
                        containerStyle={{ backgroundColor: 'transparent', height: 27, borderWidth: 0, marginTop: 20, marginBottom: 20 }}
                        textStyle={{ fontSize: 12, color: '#fff' }}
                        buttonStyle={{ width: 85, borderRadius: 25, borderColor: '#6e7892', borderWidth: 1 }}
                        selectedButtonStyle={{ backgroundColor: '#6e7892' }}
                    />
                    <Text style={{ fontSize: 10 }}>{!this.state.loading && 'Count'}</Text>
                    {this.state.selectedIndex == 0 || this.state.selectedIndex == 2 ?
                        <View>

                            <View style={{ height: 200, flexDirection: 'row', marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>

                                <View style={{ flex: 1, position: 'absolute' }}>
                                    <ActivityIndicator animating={this.state.loading} size="large" color="#fff" style={{ alignSelf: 'center' }} />
                                </View>
                                <View style={{ flex: 1, position: 'absolute' }}>
                                    <Text style={{ fontSize: 16, color: '#707992' }}>{((this.state.selectedIndex == 2) && (this.state.profileGuarded == 0) && (this.state.profileCritical.length == 0)) && 'No data yet'}</Text>
                                </View>
                                <YAxis
                                    data={this.state.selectedIndex == 0 ? this.state.globalCritical :
                                        this.state.selectedIndex == 1 ? this.state.sectorCritical : this.state.profileCritical}
                                    yAccessor={({ item }) => item.reportRiskCount}
                                    contentInset={{ top: 10, bottom: 25 }}
                                    svg={{ fontSize: 12, fill: '#707992' }}
                                    min={0}
                                    numberOfTicks={5}
                                    formatLabel={value => value}
                                />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <AreaChart
                                        style={{ flex: 1 }}
                                        data={this.state.selectedIndex == 0 ? this.state.globalGuarded :
                                            this.state.selectedIndex == 1 ? this.state.sectorGuarded : this.state.profileGuarded}
                                        yAccessor={({ item }) => item.reportRiskCount}
                                        xAccessor={({ item }) => item.reportDate}
                                        xMin={this.state.days} xMax={1}
                                        yMin={0} yMax={this.state.selectedIndex == 0 ? this.state.yMax : this.state.selectedIndex == 1 ? this.state.yMaxSector : this.state.yMaxProfile}
                                        contentInset={{ top: 10, bottom: 10 }}
                                        curve={shape.curveCatmullRom}
                                        svg={{ fill: 'url(#gradient)' }}
                                    >
                                        <Grid />
                                        <LineGuarded />
                                        <PointsGuarded />
                                        <GradientGuarded />

                                    </AreaChart>
                                    <AreaChart
                                        style={StyleSheet.absoluteFill}
                                        data={this.state.selectedIndex == 0 ? this.state.globalCritical :
                                            this.state.selectedIndex == 1 ? this.state.sectorCritical : this.state.profileCritical}
                                        yAccessor={({ item }) => item.reportRiskCount}
                                        xAccessor={({ item }) => item.reportDate}
                                        xMin={this.state.days} xMax={1}
                                        yMin={0} yMax={this.state.selectedIndex == 0 ? this.state.yMax : this.state.selectedIndex == 1 ? this.state.yMaxSector : this.state.yMaxProfile}
                                        contentInset={{ top: 10, bottom: 10 }}
                                        curve={shape.curveCatmullRom}
                                        svg={{ fill: 'url(#gradient)' }}
                                    >
                                        <LineCritical />
                                        <PointsCritical />
                                        <GradientCritical />

                                    </AreaChart>
                                    <XAxis
                                        data={this.state.selectedIndex == 0 ? this.state.globalGuarded :
                                            this.state.selectedIndex == 1 ? this.state.sectorGuarded : this.state.profileGuarded}
                                        xAccessor={({ item }) => item.reportDate}
                                        svg={{ fontSize: 12, fill: '#707992' }}
                                        contentInset={{ left: 10 }}
                                        numberOfTicks={5}
                                        min={this.state.days} max={1}
                                        formatLabel={value => value + 'd'}
                                    />
                                </View>


                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 10, justifyContent: 'space-evenly', alignItems: 'flex-end', opacity: .8 }}>
                                <Text style={{ color: '#fb4969', fontWeight: 'bold', fontSize: 12 }}>• Critical</Text>
                                <Text style={{ color: '#faf549', fontWeight: 'bold', fontSize: 12 }}>• Guarded</Text>
                            </View>

                            <Text style={[style.h5, { alignSelf: 'center' }]}>{this.state.selectedIndex == 0 ? 'System Wide Results' : 'User-Submitted Results'}</Text>
                        </View>
                        :
                        <View style={[style.body, { flex: 1, alignItems: 'center', marginTop: 0, paddingVertical: 0 }]}>
                            <Carousel
                                ref={ref => this.carouselRef = ref}
                                data={entries}
                                renderItem={this.renderSectorGraph.bind(this)}
                                sliderWidth={this.state.sliderWidth}
                                onSnapToItem={index => this.setState({ activeSector: index + 1 })}
                                itemWidth={this.state.sliderWidth}
                            // inactiveSlideOpacity={0}
                            // inactiveSlideScale={0.75}
                            />
                            <Pagination
                                dotsLength={this.state.sectorTypes.length}
                                activeDotIndex={this.state.activeSector - 1}
                                dotStyle={{
                                    width: 7,
                                    // height: 7,
                                    borderRadius: 5,
                                    backgroundColor: '#fa4969'
                                }}
                                containerStyle={{ paddingVertical: 10 }}
                                dotContainerStyle={{ marginHorizontal: 2 }}
                                tappableDots={!!this.carouselRef}
                                carouselRef={this.carouselRef}
                                inactiveDotStyle={{ backgroundColor: '#575a6f' }}
                                inactiveDotScale={1}
                                inactiveDotOpacity={1}
                            />
                        </View >
                    }

                    <Divider style={{ height: 1, backgroundColor: '#737589', marginVertical: 20 }} />

                    {/* <YAxis
                        style={{ position: 'absolute', top: 0, bottom: 0 }}
                        data={StackedAreaChart.extractDataPoints(data, keys)}
                        contentInset={{ top: 10, bottom: 10 }}
                        svg={{
                            fontSize: 8,
                            fill: 'white',
                            stroke: 'black',
                            strokeWidth: 0.1,
                            alignmentBaseline: 'baseline',
                            baselineShift: '3',
                        }}
                    /> */}

                    <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Threat Conditions</Text>
                </View>
                <View style={styles.container}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={{ width: '100%', height: '100%' }}
                        region={{
                            latitude: this.state.location.coords.latitude,
                            longitude: this.state.location.coords.longitude,
                            latitudeDelta: .2,
                            longitudeDelta: .2
                        }}
                        onMapReady={() => this.setState({ tracksViewChanges: false })}
                    >
                        {this.state.markers.map((marker, index) =>
                            (
                                <MapView.Marker
                                    coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                                    key={index}
                                    tracksViewChanges={this.state.tracksViewChanges}
                                >
                                    <View
                                    // style={style.auraGuarded}
                                    >
                                        <View style={marker.reportRiskScore == '2.00' ? style.circleCritical : style.circleGuarded} />
                                        {/* <View style={style.auraGuarded}>
                                    <View style={style.circleGuarded} /> */}
                                    </View>
                                </MapView.Marker>
                            ))}
                    </MapView>
                </View>
            </ScrollView >
        )
    }
}




const styles = StyleSheet.create({
    container: {
        height: 300,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});