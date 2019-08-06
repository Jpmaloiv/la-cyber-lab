import React from 'react'
import { ActivityIndicator, AsyncStorage, Text, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { ButtonGroup, Divider } from 'react-native-elements'
// import Geolocation from '@react-native-community/geolocation';
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import { AreaChart, Grid, StackedAreaChart, XAxis, YAxis } from 'react-native-svg-charts'
import * as scale from 'd3-scale'
import * as shape from 'd3-shape'
import moment from 'moment'
import dateFns from 'date-fns'
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import style from '../../../style'


export default class Home extends React.Component {
    constructor() {
        super()
        this.state = {
            selectedIndex: 0,
            globalData: [],
            globalGuarded: [], globalCritical: [],
            markers: [],
            location: {
                coords: {
                    latitude: 0,
                    longitude: 0,
                }
            },
            loading: true
        }
    }


    async componentDidMount() {
        axios.get(`${global.BASE_URL}/reports/risk/global?days=${30}`, { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                // console.log(resp)
                this.sortReports(resp.data.results[0][0])
            })
            .catch(err => console.error(err))

        if (Platform.OS === 'android' && !Constants.isDevice) {

            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        } else {
            this._getLocationAsync();
        }
    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let location = await Location.getCurrentPositionAsync({});
        console.log(location)


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

    sortReports(global) {
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
        console.log("HERE", globalCritical)

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

    updateIndex(selectedIndex) {
        this.setState({ selectedIndex })
    }

    test(item) {
        console.log(item)
    }


    render() {
        // console.log("CRITICAL", this.state.globalCritical)
        console.log("GUARDED", this.state.globalGuarded) 



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

        const PointsGuarded = ({ x, y, color }) =>
            this.state.globalGuarded.map((item, index) => (
                <View>
                    {this.test(item)}
                    {item.marker ?
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
                        : <View />}
                </View>
            ))

        const PointsCritical = ({ x, y, color }) =>
            this.state.globalCritical.map((item, index) => (
                <Circle
                    key={index}
                    cx={x(moment(item.reportDate))}
                    cy={y(item.reportRiskCount)}
                    r={5}
                    stroke='#fb4969'
                    strokeWidth={3}
                    fill='#fff'
                    onPress={() => this.setState({ tooltipX: moment(item.date), tooltipY: item.score, tooltipIndex: index })}
                />))

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


        // Example
        const data = [
            {
                month: new Date(2015, 0, 1),
                apples: 3840,
                bananas: 1920,
                cherries: 960,

            },
            {
                month: new Date(2015, 1, 1),
                apples: 1600,
                bananas: 1440,
            },
            {
                month: new Date(2015, 2, 1),
                apples: 640,
                bananas: 960,
            },
            {
                month: new Date(2015, 3, 1),
                apples: 3320,
                bananas: 480,
            },
        ]

        const colors = ['#8800cc', '#aa00ff', '#cc66ff', '#eeccff']
        const keys = ['guarded', 'critical']
        const svgs = [
            { onPress: () => console.log('apples') },
            { onPress: () => console.log('bananas') },
            { onPress: () => console.log('cherries') },
            { onPress: () => console.log('dates') },
        ]

        return (
            <ScrollView contentContainerStyle={{ paddingTop: 70 }}>
                <View style={style.body}>

                    <Text style={style.h1}>LA Cyber Lab</Text>
                    <Text style={style.h4}>State of affairs in Greater LA</Text>

                    <Divider style={{ height: 2, backgroundColor: '#737589', marginVertical: 20 }} />

                    <Text style={style.h2}>Threat Trend</Text>

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
                    <View style={{ height: 200, flexDirection: 'row', marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>

                        <View style={{ flex: 1, position: 'absolute' }}>
                            <ActivityIndicator animating={this.state.loading} size="large" color="#fff" style={{ alignSelf: 'center' }} />
                        </View>
                        <YAxis
                            data={this.state.selectedIndex == 0 ? this.state.globalCritical :
                                this.state.selectedIndex == 1 ? dataIndustry : dataPersonal}
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
                                    this.state.selectedIndex == 1 ? dataIndustry : dataPersonal}
                                yAccessor={({ item }) => item.reportRiskCount}
                                xAccessor={({ item }) => item.reportDate}
                                xMin={30} xMax={1}
                                yMin={0} yMax={this.state.yMax}
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
                                    this.state.selectedIndex == 1 ? dataIndustry : dataPersonal}
                                yAccessor={({ item }) => item.reportRiskCount}
                                xAccessor={({ item }) => item.reportDate}
                                xMin={30} xMax={1}
                                yMin={0} yMax={this.state.yMax}
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
                                    this.state.selectedIndex == 1 ? dataIndustry : dataPersonal}
                                xAccessor={({ item }) => item.reportDate}
                                svg={{ fontSize: 12, fill: '#707992' }}
                                contentInset={{ left: 10 }}
                                numberOfTicks={5}
                                min={30} max={1}
                                formatLabel={value => value + 'd'}
                            />
                        </View>

                    </View>


                    <Divider style={{ height: 2, backgroundColor: '#737589', marginVertical: 20 }} />

                    <YAxis
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
                    />

                    <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Threat Conditions</Text>
                </View>
                <View style={styles.container}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={{ width: '100%', height: '100%' }}
                        region={{
                            latitude: this.state.location.coords.latitude,
                            longitude: this.state.location.coords.longitude,
                            latitudeDelta: 0.09,
                            longitudeDelta: 0.0121
                        }}
                    >
                        {this.state.markers.map((marker, index) => (
                            <MapView.Marker
                                coordinate={marker.latlng}
                                key={index}
                            >
                                <View style={style.aura}>
                                    <View style={style.circle} />
                                </View>
                            </MapView.Marker>
                        ))}
                    </MapView>
                </View>
                <View style={style.body}>


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