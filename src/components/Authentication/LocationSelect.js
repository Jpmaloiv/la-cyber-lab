
import React from 'react';
import { AsyncStorage, Text, View } from 'react-native'
import { Button, Input } from 'react-native-elements'
import axios from 'axios'
import style from '../../../style'


export default class LocationSelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    // Creates and registers the user, then adds the industries they selected
    async register() {
        let { params } = this.props.navigation.state

        await axios.post(`${global.BASE_URL}/auth/signup`, {
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
            password: params.password,
            postalCode: this.state.postalCode
        })
            .then(resp => {
                console.log(resp)
                AsyncStorage.multiSet([['token', resp.headers.authorization], ['email', params.email]])
                if (params.industries.length == 0) this.props.navigation.navigate('Home')
            })
            .catch(err => console.log(err))

        console.log(params.industries)
        for (var i = 0; i < params.industries.length; i++) {
            console.log("HERE")
            let sectorId = params.industries[i]

            try {
                await axios.post(`${global.BASE_URL}/users/update/sector?email=${params.email}`, {
                    sectorId: sectorId
                })
                if (i === params.industries.length - 1) {
                    console.log("DONE!")
                    this.props.navigation.navigate('Home')
                }
            }
            catch { err => console.error(err) }
        }
    }

    render() {

        return (
            <View style={[style.body, { flex: 1, justifyContent: 'center' }]}>
                <Text style={style.h3}>Where are you located?</Text>
                <Text style={style.h6}>Your Location</Text>

                <Input
                    placeholder='Enter Zip Code'
                    placeholderTextColor='#707992'
                    inputStyle={{ color: '#fff' }}
                    onChangeText={postalCode => this.setState({ postalCode })}
                />

                <Button
                    title="REGISTER"
                    titleStyle={{ fontSize: 14 }}
                    buttonStyle={[style.button, { alignSelf: 'center' }]}
                    onPress={this.register.bind(this)}
                />
            </View>
        );
    }

}