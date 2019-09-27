
import React from 'react';
import constants from '../../../constants'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Button, CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/AntDesign'
import style from '../../../style'
import axios from 'axios';


export default class IndustrySelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            industries: [],
            sectors: []
        }
    }

    static navigationOptions = ({ navigation }) => {
        return {
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name='arrowleft' color='#fff' size={30} />
                </TouchableOpacity>
            )
        }
    }

    componentDidMount() {
        axios.get(`${constants.BASE_URL}/sectors`, { headers: { 'Authorization': constants.AUTHORIZATION_TOKEN } })
            .then(resp => {
                console.log(resp.data)
                let sectors = resp.data.userSectors

                this.setState({ sectors })
            })
            .catch(err => console.log(err))
    }

    next() {
        let { params } = this.props.navigation.state
        params.industries = this.state.industries
        this.props.navigation.navigate('LocationSelect', params)
    }

    render() {
        const { industries, sectors } = this.state

        return (
            <View style={[style.body, { flex: 1 }]}>
                <View style={{ marginBottom: 15 }}>
                    <Text style={style.h1}>What Industry</Text>
                    <Text style={style.h1}>Are You In?</Text>
                </View>

                <Text style={{ fontSize: 15, color: '#f5bd00', marginTop: 10, marginBottom: 25 }}>Select All That Apply</Text>

                <ScrollView>
                    {sectors.map((el, i) =>
                        <CheckBox
                            iconRight
                            title={el.sectorDescription}
                            key={el.userSectorId}
                            containerStyle={{ paddingHorizontal: 0, paddingVertical: 15, marginHorizontal: 0, marginVertical: 0, alignItems: 'flex-end', backgroundColor: 'transparent', borderWidth: 0, borderTopWidth: 1, borderColor: '#333957' }}
                            textStyle={{ flex: 1, marginLeft: 0, fontSize: 15, fontWeight: '500', color: '#707992' }}
                            checkedIcon={<Icon name='checkcircleo' size={25} color='#f5bd00' />}
                            uncheckedIcon={<View style={{ borderWidth: 1, borderColor: "#fff", backgroundColor: '#202642', height: 25, width: 25, borderRadius: 50 }} />}
                            checked={industries.includes(el.userSectorId)}
                            // Toggles industry selection up to 3 choices
                            onPress={() => {

                                industries.includes(el.userSectorId)
                                    ? industries.splice(industries.indexOf(el.userSectorId), 1)
                                    : industries.length != 3
                                        ? industries.push(el.userSectorId)
                                        : Alert.alert(
                                            'Maximum of 3 Industries Allowed',
                                            '',
                                            [{ text: 'OK' }],
                                            { cancelable: false },
                                        )
                                this.setState({ render: !this.state.render })
                            }}

                        />
                    )}


                </ScrollView>

                <View style={{ justifyContent: 'flex-end' }}>
                    <Button
                        title="NEXT"
                        titleStyle={{ fontSize: 15, fontWeight: '900' }}
                        buttonStyle={[style.button, { height: 55, width: '100%', alignSelf: 'center' }]}
                        onPress={this.next.bind(this)}
                        disabled={this.state.industries == 0}
                        disabledStyle={{ backgroundColor: '#fa496975' }}
                    />
                </View>

            </View>
        );
    }

}