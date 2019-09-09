
import React from 'react';
import constants from '../../../constants'
import { Alert, ScrollView, Text, View } from 'react-native'
import { Button, CheckBox } from 'react-native-elements'
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
            <View style={[style.body, { flex: 1, marginBottom: 50 }]}>
                <Text style={[style.h3, { marginVertical: 5 }]}>What industry are you in?</Text>
                <Text style={[style.h5, { marginVertical: 5 }]}>Select All That Apply</Text>
                <ScrollView>

                    {sectors.map((el, i) =>
                        <CheckBox
                            center
                            title={el.sectorDescription}
                            key={el.userSectorId}
                            containerStyle={{ alignItems:"flex-start",backgroundColor: 'transparent' }}
                            textStyle={{ color: '#fff' }}
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
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

                <Button
                    title="NEXT"
                    titleStyle={{ fontSize: 14 }}
                    buttonStyle={[style.button, { alignSelf: 'center' }]}
                    onPress={this.next.bind(this)}
                    disabled={this.state.industries == 0}
                    disabledStyle={{ backgroundColor: '#fa496975' }}
                />

            </View>
        );
    }

}