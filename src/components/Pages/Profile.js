import React from 'react'
import constants from '../../../constants'
import { ActivityIndicator, Alert, AsyncStorage, Image, Platform, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Keyboard } from 'react-native'
import { Button, Input } from 'react-native-elements';
import { Linking } from 'expo'
import axios from 'axios'
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFeather from 'react-native-vector-icons/Feather'
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons'
import style from '../../../style'


export default class Profile extends React.Component {
    constructor() {
        super()
        this.state = { appUrlScheme: '', emails: [], sectorIds: [], loading: false, errors: [], connection: true, firstNameError: '', lastNameError: '' }
    }

    async componentDidMount() {
        this.getProfile()

        this.setState({
            appUrlScheme: await Linking.makeUrl('verify/email')
        })

        // Handle email verification if app is open
        Linking.addEventListener('url', ({ url }) => {
            console.log("Event listener fired:", url)
            this.getProfile();
        })

        this.focusListener = this.props.navigation.addListener('didFocus', async () => {

            let notificationCounter = await AsyncStorage.getItem('notificationCounter')
            console.log('COUNTER:', notificationCounter)
            this.setState({ notificationCounter })

        })
    }

    componentDidUpdate() {
        if ((this.state.firstName) && (this.state.firstNameError)) this.setState({ firstNameError: '' })
        if ((this.state.lastName) && (this.state.lastNameError)) this.setState({ lastNameError: '' })
        if ((this.state.postalCode) && (this.state.postalCode.length == 5) && (/\d/.test(this.state.postalCode)) && (this.state.postalCodeError)) this.setState({ postalCodeError: '' })
        if ((this.state.sectorIds.length > 0) && (this.state.sectorError)) this.setState({ sectorError: '' })
    }

    async getProfile() {

        const email = await AsyncStorage.getItem('email')
        axios.get(`${constants.BASE_URL}/users/profile?registeredProfileEmail=${email}&userProfileId`,
            { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                console.log(resp.data)
                let data = resp.data.userProfile[0]

                this.setState({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    postalCode: data.postalCode,
                    oldEmail: data.registeredEmail,
                    email: data.registeredEmail,
                    verified: data.verified
                })
            })
            .catch(err => {
                this.setState({ connection: false })
                console.log('Error fetching profile data', err)
            })

        axios.get(`${constants.BASE_URL}/users/profile/email?registeredProfileEmail=${email}&userProfileId=${await AsyncStorage.getItem('userProfileId')}`,
            { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                console.log("Additional emails:", resp.data)
                // !! Same as below
                let arr = [];
                for (let i = 0; i < resp.data.userProfileEmails.length; i++) {
                    arr.push(resp.data.userProfileEmails[i].registeredEmail)
                }
                this.setState({ oldEmails: arr, emails: resp.data.userProfileEmails })
            })
            .catch(err => {
                this.setState({ connection: false })
                console.log('Error fetching profile emails', err)
            })

        axios.get(`${constants.BASE_URL}/users/sector?registeredProfileEmail=${email}&userProfileId`,
            { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                let arr = []
                let arr2 = []
                let { userSectors } = resp.data
                // !! For some bizarre reason there needs to be 2 separate arrays, otherwise oldSectorIds copies the updated values on Change Industries page
                for (let i = 0; i < userSectors.length; i++) {
                    arr.push(userSectors[i].userSectorId)
                }
                for (let i = 0; i < userSectors.length; i++) {
                    arr2.push(userSectors[i].userSectorId)
                }
                this.setState({ oldSectorIds: arr })
                this.setState({ sectorIds: arr2 }, this.checkAccountType)
            })
            .catch(err => {
                this.setState({ connection: false })
                console.log('Error fetching user sectors', err)
            })
    }

    checkAccountType() {
        if ((this.state.sectorIds.length == 1) && (this.state.sectorIds.includes(1))) { this.setState({ accountType: 'personal' }) }
        else { this.setState({ accountType: 'business' }) }
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

    validateEmailFormat() {
        let validated = true
        for (let i = 0; i < this.state.emails.length; i++) {
            let email = ''
            if ((typeof (this.state.emails[i]) === 'string')) { email = this.state.emails[i] }
            else if ((typeof (this.state.emails[i]) === 'object')) { email = this.state.emails[i].registeredEmail }
            console.log("TEST SUBJECT", email)
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                this.state.errors[i] = 'Please enter a valid email format'
                validated = false
            }
        }
        return validated;
    }

    // Validate that email isn't already registered
    async validateNewEmail(email) {
        console.log("HERE", email)
        let validation = await axios.get(`${constants.BASE_URL}/auth/validate?registeredProfileEmail=${email}`)
            .then(resp => {
                console.log("RESP", resp.data)
                if (resp.data.isValidEmail == 1) return true
                else return false
            })
            .catch(err => {
                console.log(err)
                return 'error'
            })
        console.log("VALIDATION", validation)

        if (!validation) {
            Alert.alert(
                'Email already registered',
                email,
                [{ text: 'OK' }],
                { cancelable: false },
            );
        }
        else if (validation === 'error') {
            Alert.alert(
                'Issue connecting to server',
                'Please try again later',
                [{ text: 'OK' }],
                { cancelable: false },
            );
        }

        return validation;
    }

    validateFields() {
        let validation = true

        if (!this.state.firstName) {
            this.setState({ firstNameError: 'First name cannot be blank' })
            validation = false
        }
        if (!this.state.lastName) {
            this.setState({ lastNameError: 'Last name cannot be blank' })
            validation = false
        }
        if ((!this.state.postalCode) || (this.state.postalCode.length != 5) || (!/\d/.test(this.state.postalCode))) {
            this.setState({ postalCodeError: 'Please enter a valid postal code' })
            validation = false
        }
        if (this.state.sectorIds.length == 0) {
            this.setState({ sectorError: 'You must select at least 1 industry' })
            validation = false
        }

        return validation;
    }


    async updateUser() {

        this.setState({ loading: true })
        let completion = true

        let validation = await this.validateFields();
        if (!validation) return this.setState({ loading: false })

        let validated = await this.validateEmailFormat();
        if (!validated) return this.setState({ loading: false })

        let token = await AsyncStorage.getItem('token')
        let email = await AsyncStorage.getItem('email')
        let userProfileId = await AsyncStorage.getItem('userProfileId')

        let { oldSectorIds, sectorIds } = this.state

        // Deletes old sectors
        for (let i = 0; i < oldSectorIds.length; i++) {
            if (!sectorIds.includes(oldSectorIds[i])) {
                axios.delete(`${constants.BASE_URL}/users/sector?registeredProfileEmail=${email}&userProfileId=${userProfileId}&userSectorId=${oldSectorIds[i]}`, { headers: { 'Authorization': token } })
                    .then(resp => console.log(resp.data))
                    .catch(err => {
                        console.log("Error deleting user sector(s)", err)
                        completion = false
                    })
            }

            if (i == oldSectorIds.length - 1) AsyncStorage.setItem('refresh', 'true')
        }

        // Add new sectors 
        for (let i = 0; i < sectorIds.length; i++) {
            if (!oldSectorIds.includes(sectorIds[i])) {
                axios.post(`${constants.BASE_URL}/users/sector?registeredProfileEmail=${email}&userProfileId=${userProfileId}&userSectorId=${sectorIds[i]}`, {}, { headers: { 'Authorization': token } })
                    .then(resp => console.log(resp.data))
                    .catch(err => {
                        console.log("Error adding user sector(s)", err)
                        completion = false
                    })
            }

            if (i == sectorIds.length - 1) AsyncStorage.setItem('refresh', 'true')

        }

        // Update user profile
        await axios.put(`${constants.BASE_URL}/users/profile?registeredProfileEmail=${this.state.oldEmail}&userProfileId=${userProfileId}&firstName=${this.state.firstName}&lastName=${this.state.lastName}&postalCode=${this.state.postalCode}`, {}, { headers: { 'Authorization': token } })
            .then(resp => {
                console.log(resp.data)
            })
            .catch(err => {
                console.log(err)
                completion = false
            })


        // Update email accounts
        for (let i = 0; i < this.state.emails.length; i++) {
            if (this.state.emails[i].registeredEmail !== this.state.oldEmails[i]) {
                await axios.put(`${constants.BASE_URL}/users/profile/email?registeredProfileEmail=${email}&userProfileId=${userProfileId}&oldEmail=${this.state.oldEmails[i]}&newEmail=${this.state.emails[i].registeredEmail}`, {}, { headers: { 'Authorization': token } })
                    .then(resp => {
                        console.log(resp)
                    })
                    .catch(err => {
                        console.log(err)
                        completion = false
                    })
            }
        }

        // Filter array by removing old emails and placeholders, and keeping new ones
        let arr = this.state.emails.filter(e => typeof e === 'string' && e !== 'Enter email address')

        // Add email accounts
        for (var i = 0; i < arr.length; i++) {

            try {
                let validated = await this.validateNewEmail(arr[i]);
                console.log("ADDING EMAIL", userProfileId, arr[i])
                if (validated) {
                    await axios.post(`${constants.BASE_URL}/users/profile/email?registeredProfileEmail=${this.state.oldEmail}&userProfileId=${userProfileId}&newEmail=${arr[i]}`, {}, { headers: { 'Authorization': token } })
                        .then(resp => {
                            console.log('Additional email created', resp.data)
                            this.handleEmailVerification(arr[i])
                        })
                }

            }
            catch {
                err => {
                    console.log('Error adding additional email(s)', err)
                    completion = false;
                }
            }
        }

        this.getProfile();
        this.setState({ error: null, loading: false })

        if (completion) this.setState({ updated: true })
    }


    addEmail() {
        this.state.emails.push('Enter email address')
        this.setState({ render: !this.state.render })
    }

    async removeEmail(email, i) {
        axios.delete(`${constants.BASE_URL}/users/profile/email?registeredProfileEmail=${await AsyncStorage.getItem('email')}&userProfileId=${await AsyncStorage.getItem('userProfileId')}&deleteEmail=${email}`, { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                console.log("RESP", resp.data)
                this.getProfile();
            })
            .catch("Error removing email", err => console.log(err))

    }


    deleteEmail(email, i) {

        Alert.alert(
            'Delete email?',
            'This will take effect immediately',
            [{ text: 'OK', onPress: () => this.removeEmail(email, i) },
            { text: 'Cancel' }],
            { cancelable: false },
        );

    }

    async switchAccountType() {

        let email = await AsyncStorage.getItem('email');
        let userProfileId = await AsyncStorage.getItem('userProfileId')
        let token = await AsyncStorage.getItem('token')

        Alert.alert(
            'Switch account type?',
            `Continue to change your account to a ${this.state.accountType === 'business' ? 'Personal' : 'Business'} type`,
            [{
                text: 'OK', onPress: () => {

                    if (this.state.accountType === 'business') {
                        axios.post(`${constants.BASE_URL}/users/sector?registeredProfileEmail=${email}&userProfileId=${userProfileId}&userSectorId=${1}`, {}, { headers: { 'Authorization': token } })
                            .then(resp => {
                                console.log(resp.data)
                            })
                            .catch(err => console.log("Error adding user sector(s)", err))

                        for (let i = 0; i < this.state.sectorIds.length; i++) {
                            axios.delete(`${constants.BASE_URL}/users/sector?registeredProfileEmail=${email}&userProfileId=${userProfileId}&userSectorId=${this.state.sectorIds[i]}`, { headers: { 'Authorization': token } })
                                .then(resp => {
                                    console.log(resp.data)
                                    if (i === sectorIds.length - 1) this.getProfile();
                                })
                                .catch(err => ("Error deleting user sector(s)", err))
                        }
                        this.setState({ accountType: 'personal' })
                    }

                    else if (this.state.accountType === 'personal') {
                        axios.delete(`${constants.BASE_URL}/users/sector?registeredProfileEmail=${email}&userProfileId=${userProfileId}&userSectorId=${1}`, { headers: { 'Authorization': token } })
                            .then(resp => {
                                console.log(resp.data)
                                this.setState({ accountType: 'business' }, this.getProfile)
                            })
                            .catch(err => console.log("Error deleting user sector when switching account type", err))
                    }
                    AsyncStorage.setItem('refresh', 'true')
                }
            },
            { text: 'Cancel' }],
            { cancelable: false },
        );
    }

    refresh = (sectorIds) => {
        // !! Not sure how this is working with below uncommented
        // console.log("ID'S:", this.state.oldSectorIds, sectorIds)
        // this.setState({ sectorIds })
        this.setState({ render: !this.state.render })
    }

    async handleEmailVerification(email) {
        let registeredProfileEmail = await AsyncStorage.getItem('email')
        let token = await AsyncStorage.getItem('token')
        let userProfileId = await AsyncStorage.getItem('userProfileId')

        Alert.alert(
            'Email not verified',
            'Send verification email?',
            [{
                text: 'Ok',
                onPress: () =>
                    axios.post(`${constants.BASE_URL}/auth/verify/email?registeredProfileEmail=${registeredProfileEmail}&userProfileId=${userProfileId}&additionalEmail=${email}&appUrlScheme=${this.state.appUrlScheme}`, {}, { headers: { 'Authorization': token } })
                        .then(resp => {
                            console.log(resp.data)
                            Alert.alert(
                                'Verification email sent',
                                email,
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

    onShare = async () => {
        try {
            let url;
            if (Platform.OS === 'ios') url = 'https://apps.apple.com/us/app/la-cyber-lab/id1478304601'
            else if (Platform.OS === 'android') url = 'https://play.google.com/store/apps/details?id=com.lacyberlab.lacyberlab&hl=en'

            const result = await Share.share({
                message: `LA Cyber Lab | This App is designed to verify email compromise.\n${Platform.OS === 'android' ? url : ''}`,
                url: 'https://apps.apple.com/us/app/la-cyber-lab/id1478304601'
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    timeout() {
        setTimeout(() => { this.setState({ updated: false }) }, 2000)
    }

    render() {

        const { emails } = this.state

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >
                <View style={{ flex: 1 }}>
                    <View style={[this.state.loading || !this.state.connection && { opacity: .5 }, { flex: 1 }]}>
                        <View style={style.header}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={style.h1}>My Account</Text>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('Threats')}>
                                    <Image source={require('../../../assets/images/notification.png')} style={{ width: 25, height: 27 }} />
                                    {this.state.notificationCounter > 0 &&
                                        <View style={{
                                            position: 'absolute',
                                            right: 0,
                                            borderRadius: 30 / 2,
                                            backgroundColor: '#fa4969',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}><Text style={{ fontSize: 10, padding: 1, paddingHorizontal: 4 }}>{this.state.notificationCounter}</Text></View>
                                    }
                                </TouchableOpacity>
                            </View>
                            <Text style={style.h6}>Set up your account</Text>
                        </View>
                        <View style={[style.body, { flex: 1, backgroundColor: '#1f243f' }]}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={style.h3}>Profile Name</Text>
                                    <TouchableOpacity style={[styles.info, { borderBottomWidth: 0, paddingBottom: 0 }]} onPress={() => this.firstName.focus()}>
                                        <Input
                                            ref={input => this.firstName = input}
                                            placeholder="First Name"
                                            placeholderTextColor="#707992"
                                            containerStyle={{ paddingHorizontal: 0 }}
                                            inputStyle={[style.h5, { color: '#fff', minHeight: 20 }]}
                                            inputContainerStyle={{ borderBottomWidth: 1, borderBottomColor: '#333957', paddingBottom: 8 }}
                                            value={this.state.firstName}
                                            onChangeText={firstName => this.setState({ firstName })}
                                            errorMessage={this.state.firstNameError}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.info, { borderBottomWidth: 0, paddingBottom: 0 }]} onPress={() => this.lastName.focus()}>
                                        <Input
                                            placeholder="Last Name"
                                            placeholderTextColor="#707992"
                                            containerStyle={{ paddingHorizontal: 0 }}
                                            ref={input => this.lastName = input}
                                            inputStyle={[style.h5, { color: '#fff', minHeight: 20 }]}
                                            inputContainerStyle={{ borderBottomWidth: 1, borderBottomColor: '#333957', paddingBottom: 8 }}
                                            value={this.state.lastName}
                                            onChangeText={lastName => this.setState({ lastName })}
                                            errorMessage={this.state.lastNameError}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={style.h3}>Zip Code</Text>
                                    <TouchableOpacity style={[styles.info, { borderBottomWidth: 0, paddingBottom: 0 }]} onPress={() => this.postalCode.focus()}>
                                        <Input
                                            maxLength={5}
                                            keyboardType='numeric'
                                            placeholder="Zip Code"
                                            placeholderTextColor="#707992"
                                            ref={input => this.postalCode = input}
                                            containerStyle={{ paddingHorizontal: 0 }}
                                            inputStyle={[style.h5, { color: '#fff', minHeight: 20 }]}
                                            inputContainerStyle={{ borderBottomWidth: 1, borderBottomColor: '#333957', paddingBottom: 8 }}
                                            value={this.state.postalCode}
                                            onChangeText={postalCode => this.setState({ postalCode })}
                                            errorMessage={this.state.postalCodeError}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginBottom: 20 }}>
                                    <Text style={style.h3}>Registered Emails</Text>
                                    <TouchableOpacity style={[styles.email, { alignItems: 'center', paddingVertical: 0, borderBottomWidth: 3 }]} onPress={() => this.email.focus()}>
                                        <Input
                                            ref={input => this.email = input}
                                            inputStyle={[style.p, { color: '#fff', fontSize: 18 }]}
                                            containerStyle={{ flex: 1, paddingHorizontal: 0 }}
                                            inputContainerStyle={{ borderBottomWidth: 0 }}
                                            placeholder={this.state.oldEmail}
                                            placeholderTextColor='#fff'
                                            autoCapitalize='none'
                                            onChangeText={email => this.setState({ email })}
                                            editable={false}
                                        />
                                    </TouchableOpacity>
                                    <Text style={{ display: this.state.error ? 'flex' : 'none', color: 'red', fontSize: 12, marginVertical: 5 }}>Please enter a valid email address</Text>

                                    {/* Additional user emails */}
                                    {emails.map((item, i) => (
                                        <TouchableOpacity key={i} style={[styles.info, { alignItems: 'center', paddingVertical: 0 }]} >
                                            <Input
                                                placeholder={item.registeredEmail || 'Enter Email Address'}
                                                placeholderTextColor='#707992'
                                                inputStyle={[style.p, { color: '#fff' }]}
                                                containerStyle={{ flex: 1, paddingHorizontal: 0 }}
                                                inputContainerStyle={{ borderBottomWidth: 0 }}
                                                autoCapitalize='none'
                                                onChangeText={email => {
                                                    item.registeredEmail ? this.state.emails[i].registeredEmail = email : this.state.emails[i] = email;
                                                    this.setState({ render: !this.state.render })
                                                }}
                                                style={{ color: '#fff' }}
                                                errorMessage={this.state.errors[i]}
                                                errorStyle={{ marginTop: 0 }}
                                                editable={typeof (item) === 'object' ? false : true}
                                            />
                                            {(item.registeredEmail && !item.verified) && <Button
                                                title='Verify Again'
                                                titleStyle={{ fontSize: 10, fontWeight: 'bold' }}
                                                buttonStyle={[style.button, { alignSelf: 'center', padding: 5, margin: 5, width: 80, height: 30 }]}
                                                onPress={() => this.handleEmailVerification(item.registeredEmail)}
                                            />
                                            }
                                            <TouchableOpacity rejectResponderTermination hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} onPress={() => item.registeredEmail ? this.deleteEmail(item.registeredEmail, i) : [this.state.emails.splice(i, 1), this.setState({ render: !this.state.render })]}><IconFeather name='x-circle' color='#fa4969' size={15} style={{ opacity: .6 }} /></TouchableOpacity>
                                        </TouchableOpacity>

                                    ))}
                                    <TouchableOpacity style={{ flexDirection: 'row', paddingVertical: 15 }} onPress={this.state.emails[this.state.emails.length - 1] !== 'Enter email address' && this.addEmail.bind(this)}>
                                        <Icon name='plus-circle' color='#fa4969' size={15} style={{ marginRight: 5 }} />
                                        <Text style={{ color: '#fa4969', fontSize: 12, fontWeight: '500' }}>ADD ANOTHER EMAIL</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginBottom: 20 }}>
                                    <Text style={style.h3}>Settings</Text>

                                    {this.state.accountType === 'business' ?
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('ChangeIndustries', { sectorIds: this.state.sectorIds, onGoBack: this.refresh })}>
                                            <View style={[styles.info, { alignItems: 'center' }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image source={require('../../../assets/images/icon_industries.png')} style={{ width: 30, height: 30, marginRight: 10 }} />
                                                    <Text style={style.h5}>Industries  </Text>
                                                    <TouchableOpacity rejectResponderTermination hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} onPress={() => this.switchAccountType()}>
                                                        <IconMaterial name='account-switch' color='#fff' size={20} />
                                                    </TouchableOpacity>
                                                </View>
                                                <Text style={style.p}>{this.state.sectorIds.length} Selected  <Icon name='angle-right' color='#fa4969' size={15} /></Text>
                                            </View>
                                            {this.state.sectorError ? <Text style={{ fontSize: 12, color: '#ff190c', margin: 5, marginBottom: 0 }}>{this.state.sectorError}</Text> : null}
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity>
                                            <View style={[styles.info, { alignItems: 'center' }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image source={require('../../../assets/images/icon_industries.png')} style={{ width: 30, height: 30, marginRight: 10 }} />
                                                    <Text style={style.h5}>Personal </Text>
                                                    <View>
                                                        <IconMaterial rejectResponderTermination hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} onPress={() => this.switchAccountType()} name='account-switch' color='#fff' size={20} />
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    }

                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('ChangePassword')}>
                                        <View style={[styles.info, { alignItems: 'center' }]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={require('../../../assets/images/icon_password.png')} style={{ width: 30, height: 30, marginRight: 10 }} />
                                                <Text style={style.h5}>Change Password</Text>
                                            </View>
                                            <Icon name='angle-right' color='#fa4969' size={15} />
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={this.onShare}>
                                        <View style={[styles.info, { alignItems: 'center' }]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={require('../../../assets/images/icon_share.png')} style={{ width: 30, height: 30, marginRight: 10 }} />
                                                <Text style={style.h5}>Share</Text>
                                            </View>
                                            <Icon name='angle-right' color='#fa4969' size={15} />
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                <View>
                                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                        <Button
                                            title="SAVE"
                                            titleStyle={{ fontSize: 15, fontWeight: '900' }}
                                            buttonStyle={[style.button, { height: 55, width: '100%', alignSelf: 'center' }]}
                                            onPress={() => this.setState({ errors: [] }, this.updateUser.bind(this))}
                                        />
                                    </View>
                                    {/* <Button
                                        title='Sign Out'
                                        titleStyle={{ fontSize: 14 }}
                                        buttonStyle={[style.button, { alignSelf: 'center' }]}
                                        onPress={this.logout.bind(this)}
                                    /> */}
                                    <TouchableOpacity onPress={this.logout.bind(this)}>
                                        <Text style={{ color: '#faf549', alignSelf: 'flex-end' }}>Sign Out</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>

                    </View>

                    <View style={{ height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', textAlign: 'center' }}>
                        <ActivityIndicator animating={this.state.loading} size="large" color="#fff" />
                        {!this.state.connection &&
                            <View style={{ backgroundColor: 'rgba(255,255,255,1)', marginHorizontal: 50, padding: 15, borderRadius: 10 }}>
                                <Text style={{ textAlign: 'center', color: '#000', marginBottom: 7 }}>Unable to fetch your profile data. Please log out and try again.</Text>
                                <Button
                                    title='Sign Out'
                                    titleStyle={{ fontSize: 12 }}
                                    buttonStyle={[style.button, { alignSelf: 'center' }]}
                                    onPress={this.logout.bind(this)}
                                />
                            </View>
                        }
                        {this.state.updated &&
                            <View style={{ backgroundColor: 'rgba(255,255,255,1)', marginHorizontal: 50, padding: 15, borderRadius: 10 }}>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', textAlign: 'center', color: '#000' }}>Profile Updated!</Text>
                                {this.timeout()}
                            </View>
                        }
                    </View>
                </View>
            </TouchableWithoutFeedback >

        )
    }
}

const styles = StyleSheet.create({
    email: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // padding: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#333957'
    },
    info: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingLeft: 0,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#333957'
    }
});