import React from 'react'
import constants from '../../../constants'
import { ActivityIndicator, Alert, AsyncStorage, Text, TouchableWithoutFeedback, TouchableOpacity, View, Keyboard } from 'react-native'
import { Linking, Notifications } from 'expo';
import { Button, Input } from 'react-native-elements'
import IconAnt from 'react-native-vector-icons/AntDesign'
import IconFeather from 'react-native-vector-icons/Feather'
import axios from 'axios';
import style from '../../../style'


export default class SignIn extends React.Component {
    constructor(props) {
        super(props)
        this.state = { appUrlScheme: '', loading: false }
    }

    static navigationOptions = ({ navigation }) => {
        return {
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <IconAnt name='arrowleft' color='#fff' size={30} />
                </TouchableOpacity>
            ),
            headerRight: (
                <Button title='SIGN UP' buttonStyle={[style.button, { width: 73, height: 26, padding: 0, margin: 0 }]} titleStyle={{ fontSize: 12, fontWeight: '900' }} onPress={() => navigation.navigate('CreateAccount')} />
            )
        }
    }

    async componentDidMount() {
        this.setState({
            appUrlScheme: await Linking.makeUrl('verify/password')
        })
    }

    // Sets session token, user profile Id, and user email for requests
    storeData = async (authorization, userProfileId, verified) => {
        const firstPair = ['token', authorization]
        const secondPair = ['email', this.state.email]
        const thirdPair = ['userProfileId', userProfileId]
        const fourthPair = ['verified', JSON.stringify(verified)]

        console.log("PAIRS", firstPair, secondPair, thirdPair, fourthPair)
        try {
            await AsyncStorage.multiSet([firstPair, secondPair, thirdPair, fourthPair])
        } catch (err) {
            console.log('Error setting storage data from login', err)
        }

        let deviceId;

        try {
            deviceId = await Notifications.getExpoPushTokenAsync()
        }
        catch (err) { console.log("Error getting Push Token", err) }

        if (deviceId) {
            // Updates profile if a new device is being used
            axios.post(`${constants.BASE_URL}/users/device?userProfileId=${userProfileId}&deviceId=${deviceId}&fcmToken=`, {}, { headers: { 'Authorization': authorization } })
                .then(resp => console.log(resp))
                .catch(err => console.log('Error updating Device ID', err))
        }

        this.props.navigation.navigate(verified ? 'Dashboard' : 'Verification')

    }

    login() {
        this.setState({ loading: true })

        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email)) {

            axios.post(`${constants.BASE_URL}/auth/login`, {
                registeredProfileEmail: this.state.email,
                password: this.state.password
            })
                .then(resp => {
                    console.log("USER", resp.data)
                    let { authorization } = resp.headers
                    let { userProfileId, verified } = resp.data

                    if (resp.data.success) {
                        this.storeData(authorization, userProfileId, verified)
                    }
                    else {
                        this.setState({ error: 'Invalid user email and password' })
                    }
                })
                .catch(err => {
                    console.log('Error signing in', err)
                    Alert.alert(
                        'Issue connecting to server',
                        'Please try again later',
                        [{
                            text: 'OK',
                        }],
                        { cancelable: true },
                    );
                })

        } else {
            this.setState({ errorEmail: 'Please enter a valid email format' })
        }

        this.setState({ loading: false })

    }

    async handlePasswordReset() {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email)) {

            Alert.alert(
                'Send password reset email?',
                this.state.email,
                [{
                    text: 'OK', onPress: () =>
                        axios.post(`${constants.BASE_URL}/auth/verify/password?registeredProfileEmail=${this.state.email}&userProfileId&appUrlScheme=${this.state.appUrlScheme}`)
                            .then(resp => {
                                console.log('Password verification email sent', resp.data)
                                if (resp.data.success) {
                                    Alert.alert(
                                        'Password verification email sent',
                                        this.state.email,
                                        [{
                                            text: 'OK',
                                        }],
                                        { cancelable: true },
                                    );
                                }
                                // Handler error for when email isn't found
                                else if (resp.data.errno == 1411) {
                                    Alert.alert(
                                        'Invalid email address',
                                        'Please enter a valid email and try again',
                                        [{
                                            text: 'OK',
                                        }],
                                        { cancelable: true },
                                    );
                                }
                            })
                            .catch(err => console.log("ERR", err))
                },
                { text: 'Cancel' }],
                { cancelable: true },
            );
        }
        else {
            Alert.alert(
                'Please enter a valid email address',
                'Then click this button to send a password reset email',
                [{
                    text: 'OK',
                }],
                { cancelable: true },
            );
        }
    }

    componentDidUpdate() {
        if (this.state.errorEmail === 'Please enter a valid email format' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email)) this.setState({ errorEmail: '' })
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >
                <View style={[style.body, this.state.loading && { opacity: .5 }, { flex: 1, justifyContent: 'center' }]}>
                    <View style={{ height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                        <ActivityIndicator animating={this.state.loading} size="large" color="#fff" />
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={style.h1}>Sign In to</Text>
                        <Text style={style.h1}>Your Account</Text>
                    </View>
                    <View>
                        <Input
                            ref={input => this.email = input}
                            containerStyle={{ marginVertical: 8, paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }}
                            inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                            placeholder='Email Address'
                            placeholderTextColor='#707992'
                            onFocus={() => this.setState({ focusEmail: true })}
                            onBlur={() => this.setState({ focusEmail: false })}
                            onChangeText={email => this.setState({ email })}
                            autoCapitalize='none'
                            rightIcon={<TouchableOpacity style={!(this.state.email && this.state.focusEmail) && { display: 'none' }}><IconFeather name='x-circle' onPress={() => this.setState({ email: null }, this.email.clear())} color='#fa4969' size={15} style={{ paddingRight: 15 }} /></TouchableOpacity>}
                            errorMessage={this.state.errorEmail}
                        />
                        <Input
                            ref={input => this.password = input}
                            containerStyle={{ marginVertical: 8, paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }}
                            inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                            placeholder='Password'
                            placeholderTextColor='#707992'
                            onFocus={() => this.setState({ focusPw: true })}
                            onBlur={() => this.setState({ focusPw: false })}
                            onChangeText={password => this.setState({ password })}
                            autoCapitalize='none'
                            rightIcon={<TouchableOpacity style={!(this.state.password && this.state.focusPw) && { display: 'none' }}><IconFeather name='x-circle' onPress={() => this.setState({ password: null }, this.password.clear())} color='#fa4969' size={15} style={{ paddingRight: 15 }} /></TouchableOpacity>}
                            secureTextEntry
                            errorMessage={this.state.error}
                        />
                        <TouchableOpacity onPress={this.handlePasswordReset.bind(this)}>
                            <Text style={{ color: '#fa4969', fontWeight: 'bold', fontSize: 15, marginVertical: 8, alignSelf: 'flex-end' }}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <Button
                            title="SIGN IN"
                            titleStyle={{ fontSize: 15, fontWeight: '900' }}
                            buttonStyle={[style.button, { height: 55, width: '100%', alignSelf: 'center' }]}
                            onPress={this.login.bind(this)}
                            disabled={!this.state.email || !this.state.password}
                            disabledStyle={{ backgroundColor: '#fa496975' }}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}