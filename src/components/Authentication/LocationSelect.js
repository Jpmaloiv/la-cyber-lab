
import React from 'react';
import constants from '../../../constants'
import { ActivityIndicator, Alert, AsyncStorage, Platform, Text, View, Keyboard, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { Linking, Notifications } from 'expo';
import IconAnt from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/Entypo';
import { Button, Input } from 'react-native-elements'
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions';
import axios from 'axios'
import style from '../../../style'


export default class LocationSelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = { appUrlScheme: '', postalCode: '', loading: true }
    }

    static navigationOptions = ({ navigation }) => {
        return {
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <IconAnt name='arrowleft' color='#fff' size={30} />
                </TouchableOpacity>
            )
        }
    }

    async componentDidMount() {
        this._getLocationAsync();

        // Sets base URL of app for email deeplink
        this.setState({
            appUrlScheme: await Linking.makeUrl('verify/email')
        })
    }

    // Creates and registers the user, then adds the industries they selected
    async register() {

        let registered = true;

        if ((this.state.postalCode) && (this.state.postalCode.length == 5) && (/\d/.test(this.state.postalCode))) {

            let deviceId;

            try {
                deviceId = await Notifications.getExpoPushTokenAsync()
            }
            catch (err) { console.log('Error getting push token', err) }

            // deviceId = '1234'
            let { params } = this.props.navigation.state

            let data = {
                registeredProfileEmail: params.email,
                firstName: params.firstName,
                lastName: params.lastName,
                postalCode: this.state.postalCode,
                password: params.password,
                deviceId: deviceId,
                fcmToken: ''
            }

            await axios.post(`${constants.BASE_URL}/auth/signup?userProfileId`, data)
                .then(resp => {
                    console.log(resp)
                    AsyncStorage.multiSet([['token', resp.headers.authorization], ['email', params.email], ['userProfileId', resp.data.userProfileId], ['verified', 'false']])
                    if (params.industries.length == 0) this.props.navigation.navigate('Verification')
                })
                .catch(err => {
                    console.log('Error registering user', err)
                    registered = false
                })

            let email = await AsyncStorage.getItem('email')
            let userProfileId = await AsyncStorage.getItem('userProfileId')

            console.log("URL SCHEME", this.state.appUrlScheme)
            // Send email verification
            await axios.post(`${constants.BASE_URL}/auth/verify/email?registeredProfileEmail=${email}&userProfileId=${userProfileId}&additionalEmail=${email}&appUrlScheme=${this.state.appUrlScheme}`, {}, { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
                .then(resp => {
                    console.log(resp.data)
                })
                .catch(err => console.log("Error sending verification email", err))


            console.log(params.industries)
            for (var i = 0; i < params.industries.length; i++) {
                let sectorId = params.industries[i]

                try {
                    await axios.post(`${constants.BASE_URL}/users/sector?registeredProfileEmail&userSectorId=${sectorId}&userProfileId=${userProfileId}`, {}, { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
                        .then(resp => console.log(resp.data))
                        .catch(err => console.log(err))

                }
                catch { err => console.log('Error adding user sector(s) during registration', err) }
            }

            if (registered) {
                this.props.navigation.navigate('Verification')
            } else {
                Alert.alert(
                    'Issue completing registration',
                    'Please try again later',
                    [{ text: 'OK' }],
                    { cancelable: true },
                )
            }
        } else {
            Alert.alert(
                'Invalid Zip Code',
                '',
                [{ text: 'OK' }],
                { cancelable: true },
            )
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
        if (Platform.OS !== "ios")
            console.log("Location android", location)


        console.log("LOCATION", location)

        let currLocation = await Location.reverseGeocodeAsync(location.coords)
        console.log("COORDS", currLocation)

        this.setState({ activeZip: currLocation[0].postalCode, currLocation: currLocation[0], loading: false });


    }


    render() {

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >

                <View style={[style.body, { flex: 1 }]}>
                    <View style={{ marginBottom: 40 }}>
                        <Text style={style.h1}>Where Are</Text>
                        <Text style={style.h1}>You Located?</Text>
                    </View>

                    <Input
                        placeholder='Enter Zip Code'
                        placeholderTextColor='#707992'
                        rightIcon={(this.state.city && this.state.region) && <Text style={{ color: '#f5bd00', fontSize: 15, fontWeight: 'bold', paddingRight: 10 }}>{this.state.city}, {this.state.region}</Text>}
                        keyboardType='numeric'
                        inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                        inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }}
                        containerStyle={{ marginBottom: 20 }}
                        value={this.state.postalCode}
                        maxLength={5}
                        onChangeText={postalCode => this.setState({ postalCode })}
                        errorMessage={this.state.error}
                    />
                    {!this.state.loading ?
                        <TouchableOpacity onPress={() => this.setState({ postalCode: this.state.activeZip, city: this.state.currLocation.city, region: this.state.currLocation.region })} style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
                            <Icon name='location' color='rgba(250,73,105,.5)' size={15} style={{ marginRight: 7 }} />
                            <Text style={{ color: '#fa4969', fontSize: 15, fontWeight: 'bold' }}> Use your current location</Text>
                        </TouchableOpacity>
                        :
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
                            <ActivityIndicator color="#fa4969" />
                            <Text style={{ color: '#fa4969', fontSize: 15, fontWeight: 'bold' }}> Retrieving your location</Text>
                        </View>
                    }

                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <Button
                            title="DONE"
                            titleStyle={{ fontSize: 15, fontWeight: '900' }}
                            buttonStyle={[style.button, { height: 55, width: '100%', alignSelf: 'center' }]}
                            onPress={this.register.bind(this)}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback >
        );
    }

}