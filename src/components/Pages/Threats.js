import React from 'react'
import constants from '../../../constants'
import { AsyncStorage, ScrollView, Text, View, RefreshControl } from 'react-native'
import Icon from 'react-native-vector-icons/Entypo'
import { ButtonGroup, ListItem } from 'react-native-elements'
import moment from 'moment'
import style from '../../../style'
import axios from 'axios';


export default class Threats extends React.Component {
    constructor() {
        super()
        this.state = {
            threats: []
        }
    }

    async componentDidMount() {
        axios.get(`${constants.BASE_URL}/profile/emails?email=${await AsyncStorage.getItem('email')}`,
            { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                console.log('Profile emails found', resp.data)
                this.setState({
                    threatsCritical: resp.data.emails.filter(el => el.reportRiskScoreDesc === 'Critical'),
                    threatsGuarded: resp.data.emails.filter(el => el.reportRiskScoreDesc === 'Guarded')
                })
                this.updateIndex(0);
            })
            .catch(err => {
                console.log(err)
            })
    }

    _onRefresh = () => {
        this.setState({ refreshing: true });
        this.fetchData().then(() => {
            this.setState({ refreshing: false });
        })
    }

    fetchData = async () => {
        axios.get(`${constants.BASE_URL}/profile/emails?email=${await AsyncStorage.getItem('email')}`,
            { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                console.log('Profile emails found', resp.data)
                this.setState({
                    threatsCritical: resp.data.emails.filter(el => el.reportRiskScoreDesc === 'Critical'),
                    threatsGuarded: resp.data.emails.filter(el => el.reportRiskScoreDesc === 'Guarded')
                })
                this.updateIndex(0);
            })
            .catch(err => {
                console.log(err)
            })
    }
    updateIndex(selectedIndex) {
        this.setState({ selectedIndex })
        if (selectedIndex == 0) this.setState({ threats: this.state.threatsCritical })
        else if (selectedIndex == 1) this.setState({ threats: this.state.threatsGuarded })
    }

    render() {
        const buttons = ['Critical', 'Guarded']

        return (
            <View>
                <View style={style.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={style.h1}>Emails</Text>
                        <Icon name='eye' onPress={() => this.props.navigation.navigate('Recommendations')} color='#fff' size={30} />
                    </View>
                    <Text style={style.h6}>See all examined email results</Text>
                </View>

                <ButtonGroup
                    onPress={this.updateIndex.bind(this)}
                    selectedIndex={this.state.selectedIndex}
                    buttons={buttons}
                    containerStyle={{ width: '100%', backgroundColor: '#232947', borderWidth: 0, marginLeft: 0, marginTop: 0 }}
                    selectedButtonStyle={{ backgroundColor: '#232947', borderBottomWidth: 2, borderBottomColor: '#fa4969' }}
                    innerBorderStyle={{ width: 0 }}
                    textStyle={{ fontSize: 20, fontWeight: 'bold', opacity: .4 }}
                    selectedTextStyle={{ opacity: 1 }}
                />

                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />}
                    contentContainerStyle={[style.body, { backgroundColor: '#1f243f', flexGrow: 1, height: '100%' }]}
                >

                    {this.state.threats.length > 0 ?
                        <View>
                            {this.state.threats.map((item, i) => (
                                <View key={i} style={{ backgroundColor: '#222847', borderRadius: 15, marginVertical: 4 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15 }}>
                                        <Text numberOfLines={1} style={{ fontSize: 15, maxWidth: '70%', fontWeight: 'bold' }}>{item.reportTitle}</Text>
                                        <Text style={style.h7}>{moment(item.reportDate).format('MM/DD')}</Text>

                                    </View>
                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text numberOfLines={1} style={{ fontSize: 12, color: '#707992', maxWidth: '70%', paddingHorizontal: 10, paddingBottom: 10 }}>{item.eMail}</Text>
                                        {this.state.selectedIndex == 0 && <View style={{ backgroundColor: '#fa4969', borderTopLeftRadius: 14, borderBottomRightRadius: 14, padding: 10 }}><Text>Malicious URL</Text></View>}
                                    </View>
                                </View>
                            ))}
                        </View>
                        :
                        <Text style={{ textAlign: 'center' }}>
                            No emails yet. Please submit your emails to gophish@lacyberlab.net
                        </Text>
                    }
                </ScrollView>
            </View>
        )
    }
}