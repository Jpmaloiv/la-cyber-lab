
import React from 'react';
import constants from '../../../constants'
import { Alert, AsyncStorage, Text, View, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { Notifications } from 'expo';

import { Button, Input } from 'react-native-elements'
import axios from 'axios'
import style from '../../../style'


export default class LocationSelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = { postalCode: '' }
    }

    // Creates and registers the user, then adds the industries they selected
    async register() {

        let deviceId = await Notifications.getExpoPushTokenAsync();

        console.log("DEVICE ID", deviceId)
        let { params } = this.props.navigation.state
        console.log("PARAMS", params)

        let data = {
            registeredProfileEmail: params.email,
            firstName: params.firstName,
            lastName: params.lastName,
            postalCode: this.state.postalCode,
            password: params.password,
            deviceId: deviceId,
            fcmToken: ''
        }

        console.log("BODY DATA", data)

        await axios.post(`${constants.BASE_URL}/auth/signup?userProfileId`, data)
            .then(resp => {
                console.log(resp)
                AsyncStorage.multiSet([['token', resp.headers.authorization], ['email', params.email], ['userProfileId', resp.data.userProfileId], ['verified', 'false']])
                if (params.industries.length == 0) this.props.navigation.navigate('Verification')
            })
            .catch(err => {
                console.log('Error registering user', err)
            })

        let email = await AsyncStorage.getItem('email')
        let userProfileId = await AsyncStorage.getItem('userProfileId')

        // console.log("EMAIL", email, userProfileId, global.VERIFY_LINK)

        // Send email verification
        await axios.post(`${constants.BASE_URL}/auth/verify/email?registeredProfileEmail=${email}&userProfileId=${userProfileId}&additionalEmail=${email}`, {}, { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                console.log(resp.data)
                this.props.navigation.navigate('Verification')
            })
            .catch(err => console.log("Error sending verification email", err))


        console.log(params.industries)
        for (var i = 0; i < params.industries.length; i++) {
            let sectorId = params.industries[i]

            try {
                await axios.post(`${constants.BASE_URL}/users/sector?registeredProfileEmail&userSectorId=${sectorId}&userProfileId=${userProfileId}`, {}, { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
                    .then(resp => {
                        if (i == params.industries.length - 1) {
                            this.props.navigation.navigate('Verification')
                        }
                    })
                    .catch(err => console.log(err))

            }
            catch { err => console.log(err) }
        }
    }

    render() {

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >

            <View style={[style.body, { flex: 1, justifyContent: 'center' }]}>
                <Text style={style.h3}>Where are you located?</Text>
                <Text style={style.h6}>Your Location</Text>

                <Input
                    placeholder='Enter Zip Code'
                    placeholderTextColor='#707992'
                    inputStyle={{ color: '#fff' }}
                    value={this.state.postalCode}
                    maxLength={5}
                    onChangeText={postalCode => this.setState({ postalCode })}
                    errorMessage={this.state.error}
                />

                <Button
                    title="REGISTER"
                    titleStyle={{ fontSize: 14 }}
                    buttonStyle={[style.button, { alignSelf: 'center' }]}
                    onPress={this.register.bind(this)}
                />
            </View>
            </TouchableWithoutFeedback>
        );
    }

}