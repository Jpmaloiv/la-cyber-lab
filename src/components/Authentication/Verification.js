import React from 'react'
import constants from '../../../constants'
import { Alert, AsyncStorage, Image, TouchableOpacity, View } from 'react-native'
import { Button, Text } from 'react-native-elements'
import { Linking } from 'expo'
import axios from 'axios'
import style from '../../../style'


export default class Verification extends React.Component {
    constructor(props) {
        super(props)
        this.state = { appUrlScheme: '' }
    }

    async componentDidMount() {
        this.setState({
            email: await AsyncStorage.getItem('email'),
            appUrlScheme: await Linking.makeUrl('verify/email')
        })
    }

    async handleEmailVerification() {
        let registeredProfileEmail = await AsyncStorage.getItem('email')
        let token = await AsyncStorage.getItem('token')
        let userProfileId = await AsyncStorage.getItem('userProfileId')

        console.log("URL SCHEME", this.state.APP_URL_SCHEME)

        Alert.alert(
            'Email not verified',
            'Send verification email?',
            [{
                text: 'Ok',
                onPress: () =>
                    axios.post(`${constants.BASE_URL}/auth/verify/email?registeredProfileEmail=${registeredProfileEmail}&userProfileId=${userProfileId}&additionalEmail=${registeredProfileEmail}&appUrlScheme=${this.state.appUrlScheme}`, {}, { headers: { 'Authorization': token } })
                        .then(resp => {
                            console.log(resp.data)
                            Alert.alert(
                                'Verification email sent',
                                registeredProfileEmail,
                                [{ text: 'OK' }],
                                { cancelable: false },
                            )
                        })
                        .catch(err => console.log("Error sending verification email", err))
            },
            { text: 'Cancel' }],
            { cancelable: true },
        )
    }

    checkEmailVerification() {
        axios.get(`${constants.BASE_URL}/auth/validate?registeredProfileEmail=${this.state.email}`)
            .then(resp => {
                console.log("RESP", resp.data)
                if (resp.data.isValidEmail == 2) {
                    Alert.alert(
                        'Email not verified',
                        'Please check your email or resend a verification link',
                        [{ text: 'OK' }],
                        { cancelable: false },
                    );
                } else if (resp.data.isValidEmail == 3) {
                    AsyncStorage.setItem('verified', 'true')
                    this.props.navigation.navigate('Dashboard')
                }
            })
            .catch(err => {
                console.log(err)
                Alert.alert(
                    'Issue connecting to server',
                    'Please try again later',
                    [{ text: 'OK' }],
                    { cancelable: false },
                );
            })
    }

    logout() {
        Alert.alert(
            'Sign out?',
            'Please confirm you wish to sign out',
            [
                {
                    text: 'Ok',
                    onPress: () => [AsyncStorage.clear(), this.props.navigation.navigate('Welcome')]
                },
                {
                    text: 'Cancel'
                }
            ],
            { cancelable: true },
        )
    }

    render() {

        return (
            <View style={[style.body, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={[style.h1, { marginBottom: 15 }]}>Verification</Text>
                <Image source={require('../../../assets/lacl-small.png')} />
                <Text style={[style.h3, { marginBottom: 10 }]}>{this.state.email}</Text>
                <Text style={{ textAlign: 'center' }}>Your account hasn't been verified. Please click the verify link in the email sent to {this.state.email}.</Text>
                <Button
                    buttonStyle={style.button}
                    title='Resend Email'
                    titleStyle={{ fontSize: 12, fontWeight: 'bold' }}
                    onPress={() => this.handleEmailVerification()}
                />

                <Button
                    buttonStyle={style.button}
                    title='Already Verified'
                    titleStyle={{ fontSize: 12, fontWeight: 'bold' }}
                    onPress={() => this.checkEmailVerification()}
                />

                <TouchableOpacity onPress={() => this.logout()}><Text style={{ color: '#fa4969' }}>Sign Out</Text></TouchableOpacity>
            </View>
        )
    }
}