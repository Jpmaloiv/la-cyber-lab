import React from 'react'
import { AsyncStorage, Text, View } from 'react-native'
import { ButtonGroup, ListItem } from 'react-native-elements'
import style from '../../../style'
import axios from 'axios';


export default class Threats extends React.Component {
    constructor() {
        super()
        this.state = {
            selectedIndex: 0,
            threats: []
        }
    }

    async componentDidMount() {
        axios.get(`${global.BASE_URL}/profile/emails?email=${await AsyncStorage.getItem('email')}&days=${10}`,
            { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                console.log(resp)
                this.setState({ threats: resp.data.results[0] })
            })
            .catch(err => console.error(err))
    }

    updateIndex(selectedIndex) {
        this.setState({ selectedIndex })
    }

    render() {
        const buttons = ['Critical', 'Guarded']

        console.log(this.state.threats)

        const threats = [{
            reportTitle: 'CHASE',
            desc: 'So, we really need your account number right now...',
            from: 'christ.dubuque@ernser.us',
            threat: 'Malicious URL'
        },
        {
            reportTitle: 'FRIENDS ONLINE',
            desc: 'New friends are waiting for you to join with us',
            from: 'heidenreich_duncan@rau.io',
            threat: 'Disruptive Virus'
        }]

        return (
            <View>
                <View style={style.header}>
                    <Text style={style.h1}>Emails</Text>
                    <Text style={style.h6}>See all examined email results</Text>
                </View>

                <ButtonGroup
                    onPress={this.updateIndex.bind(this)}
                    selectedIndex={this.state.selectedIndex}
                    buttons={buttons}
                    containerStyle={{ width: '100%', backgroundColor: '#232947', borderWidth: 0, marginLeft: 0, marginTop: 0 }}
                    selectedButtonStyle={{ backgroundColor: '#232947', borderBottomWidth: 2, borderBottomColor: '#fa4969' }}
                    innerBorderStyle={{ width: 0 }}
                    textStyle={{ fontSize: 20, fontWeight: 'bold', opacity: .15 }}
                    selectedTextStyle={{ opacity: 1 }}
                />

                <View style={style.body}>
                    {threats.map((item, i) => (
                        <View style={{ backgroundColor: '#222847', borderRadius: 15, marginVertical: 4 }}>
                            <View style={{ padding: 15 }}>
                                <Text style={{fontSize: 15, fontWeight: 'bold'}}>{item.reportTitle}</Text>
                                <Text style={style.h7}>{item.desc}</Text>
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Text style={{ fontSize: 12, color: '#707992', paddingLeft: 15}}>{item.from}</Text>
                                <View style={{ backgroundColor: '#fa4969', borderTopLeftRadius: 14, borderBottomRightRadius: 14, padding: 10 }}><Text>{item.threat}</Text></View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        )
    }
}