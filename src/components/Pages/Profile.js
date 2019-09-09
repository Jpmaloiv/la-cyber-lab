import React from 'react'
import constants from '../../../constants'
import { ActivityIndicator, Alert, AsyncStorage, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity,TouchableWithoutFeedback, View,Keyboard } from 'react-native'
import { Button, Input } from 'react-native-elements';
import axios from 'axios'
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFeather from 'react-native-vector-icons/Feather'
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons'
import style from '../../../style'


export default class Profile extends React.Component {
    constructor() {
        super()
        this.state = { emails: [], sectorIds: [], loading: false, errors: [], connection: true }
    }

    componentDidMount() { this.getProfile() }

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
                console.log("SECTORS", resp.data)
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
        if ((this.state.sectorIds.length == 1) && (this.state.sectorIds.includes(1))) { console.log("HI"); this.setState({ accountType: 'personal' }) }
        else { console.log("HEY"); this.setState({ accountType: 'business' }) }
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
        console.log("EMAILS", this.state.emails)
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


    async updateUser() {
        this.setState({ loading: true })

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
                    .catch(err => console.log("Error deleting user sector(s)", err))
            }
        }

        // Add new sectors 
        for (let i = 0; i < sectorIds.length; i++) {
            if (!oldSectorIds.includes(sectorIds[i])) {
                console.log("HERE", email, userProfileId, sectorIds[i])
                axios.post(`${constants.BASE_URL}/users/sector?registeredProfileEmail=${email}&userProfileId=${userProfileId}&userSectorId=${sectorIds[i]}`, {}, { headers: { 'Authorization': token } })
                    .then(resp => console.log(resp.data))
                    .catch(err => console.log("Error adding user sector(s)", err))
            }
        }

        // Update user profile
        await axios.put(`${constants.BASE_URL}/users/profile?registeredProfileEmail=${this.state.oldEmail}&userProfileId=${userProfileId}&firstName=${this.state.firstName}&lastName=${this.state.lastName}&postalCode`, {}, { headers: { 'Authorization': token } })
            .then(resp => {
                console.log(resp.data)
            })
            .catch(err => console.log(err))

        // Update email accounts
        for (let i = 0; i < this.state.emails.length; i++) {
            if (this.state.emails[i].registeredEmail !== this.state.oldEmails[i]) {
                let url = `${constants.BASE_URL}/users/profile/email?registeredProfileEmail=${email}&userProfileId=${userProfileId}&oldEmail=${this.state.oldEmails[i]}&newEmail=${this.state.emails[i].registeredEmail}`
                console.log("URL", url)
                await axios.put(`${constants.BASE_URL}/users/profile/email?registeredProfileEmail=${email}&userProfileId=${userProfileId}&oldEmail=${this.state.oldEmails[i]}&newEmail=${this.state.emails[i].registeredEmail}`, {}, { headers: { 'Authorization': token } })
                    .then(resp => {
                        console.log(resp)
                        // AsyncStorage.setItem('email', this.state.email)
                    })
                    .catch(err => console.log(err))
            }
        }

        // Filter array by removing old emails and placeholders, and keeping new ones
        let arr = this.state.emails.filter(e => typeof e === 'string' && e !== 'Enter email address')

        // Add email accounts
        for (var i = 0; i < arr.length; i++) {
            try {
                await axios.post(`${constants.BASE_URL}/users/profile/email?registeredProfileEmail=${this.state.oldEmail}&userProfileId=${await AsyncStorage.getItem('userProfileId')}&newEmail=${arr[i]}`, {}, { headers: { 'Authorization': token } })
                    .then(resp => {
                        console.log(resp.data)
                    })

            }
            catch { err => console.log(err) }
        }

        this.getProfile();
        this.setState({ error: null, loading: false })
    }


    addEmail() {
        this.state.emails.push('Enter email address')
        this.setState({ render: !this.state.render })
        // console.log(this.state.emails)

        // this.setState({ emails: this.state.emails.push('hi')})
    }

    async removeEmail(email, i) {
        axios.delete(`${constants.BASE_URL}/users/profile/email?registeredProfileEmail=${await AsyncStorage.getItem('email')}&userProfileId=${await AsyncStorage.getItem('userProfileId')}&deleteEmail=${email}`, { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                console.log("RESP", resp.data)
                this.getProfile();
            })
            .catch("ERR", err => console.log(err))

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
                    axios.post(`${constants.BASE_URL}/auth/verify/email?registeredProfileEmail=${registeredProfileEmail}&userProfileId=${userProfileId}&additionalEmail=${email}`, {}, { headers: { 'Authorization': token } })
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

    render() {

        const { emails } = this.state

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >
<View style={{flex:1}}>
                <View style={[this.state.loading || !this.state.connection && { opacity: .5 }, { flex: 1 }]}>
                    <View style={style.header}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={style.h1}>My Account</Text>
                            <Icon name='bell' color='#fff' size={30} />
                        </View>
                        <Text style={style.h6}>Set up your account</Text>
                    </View>
                    <View style={[style.body, { flex: 1 }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={style.h3}>Profile Name</Text>
                                <TouchableOpacity style={styles.info} onPress={() => this.firstName.focus()}>
                                    <TextInput
                                        ref={input => this.firstName = input}
                                        placeholder="First Name"
                                        placeholderTextColor="#707992"
                                        style={[style.h5, { color: '#fff' }]}
                                        value={this.state.firstName}
                                        onChangeText={firstName => this.setState({ firstName })}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.info} onPress={() => this.lastName.focus()}>
                                    <TextInput
                                     placeholder="Last Name"
                                     placeholderTextColor="#707992"
                                        ref={input => this.lastName = input}
                                        style={[style.h5, { color: '#fff' }]}
                                        value={this.state.lastName}
                                        onChangeText={lastName => this.setState({ lastName })}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={{ marginBottom: 20 }}>
                                <Text style={style.h3}>Registered Emails</Text>
                                <TouchableOpacity style={[styles.info, { alignItems: 'center', paddingVertical: 0 }]} onPress={() => this.email.focus()}>
                                    {!this.state.verified && <TouchableOpacity onPress={() => this.handleEmailVerification(this.state.email)} rejectResponderTermination hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}><Text style={{ fontWeight: 'bold', fontSize: 22, color: 'red', paddingRight: 5 }}>!</Text></TouchableOpacity>}
                                    <Input
                                        ref={input => this.email = input}
                                        inputStyle={[style.p, { color: '#fff' }]}
                                        containerStyle={{ flex: 1, paddingHorizontal: 0 }}
                                        inputContainerStyle={{ borderBottomWidth: 0 }}
                                        placeholder={this.state.oldEmail}
                                        placeholderTextColor='#707992'
                                        autoCapitalize='none'
                                        onChangeText={email => this.setState({ email })}
                                    />
                                    {/* <Text style={style.p}>Edit Email</Text> */}
                                </TouchableOpacity>
                                <Text style={{ display: this.state.error ? 'flex' : 'none', color: 'red', fontSize: 12, marginVertical: 5 }}>Please enter a valid email address</Text>
                                {/* Additional user emails */}
                                {emails.map((item, i) => (
                                    <TouchableOpacity key={i} style={[styles.info, { alignItems: 'center', paddingVertical: 0 }]} >
                                        {/* {console.log("ITEM", item)} */}
                                        <TouchableOpacity rejectResponderTermination hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                                            {(item.registeredEmail && !item.verified) && <Text onPress={() => this.handleEmailVerification(item.registeredEmail)} style={{ fontWeight: 'bold', fontSize: 22, color: 'red', paddingRight: 5 }}>!</Text>}
                                        </TouchableOpacity>
                                        <Input
                                            placeholder={item.registeredEmail || 'Enter Email Address'}
                                            placeholderTextColor='#707992'
                                            inputStyle={[style.p, { color: '#fff' }]}
                                            containerStyle={{ flex: 1, paddingHorizontal: 0 }}
                                            inputContainerStyle={{ borderBottomWidth: 0 }}
                                            autoCapitalize='none'
                                            onChangeText={email => { [item.registeredEmail ? this.state.emails[i].registeredEmail = email : this.state.emails[i] = email, this.setState({ render: !this.state.render })] }}
                                            style={{ color: '#fff' }}
                                            errorMessage={this.state.errors[i]}
                                            errorStyle={{ marginTop: 0 }}
                                        />
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
                                        <View style={styles.info}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Icon name='building' color='#f5bd00' size={20} style={{ marginRight: 5 }} />
                                                <Text style={style.h5}>Industries  <IconMaterial onPress={() => this.switchAccountType()} name='account-switch' color='#fff' size={18} /></Text>
                                            </View>
                                            <Text style={style.p}>{this.state.sectorIds.length} Selected  <Icon name='angle-right' color='#fa4969' size={15} /></Text>
                                        </View>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity>
                                        <View style={styles.info}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Icon name='building' color='#f5bd00' size={20} style={{ marginRight: 5 }} />
                                                <Text style={style.h5}>Personal  <IconMaterial onPress={() => this.switchAccountType()} name='account-switch' color='#fff' size={18} /></Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                }

                                <TouchableOpacity onPress={() => this.props.navigation.navigate('ChangePassword')}>
                                    <View style={styles.info}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon name='lock' color='#49fa69' size={20} style={{ marginRight: 5 }} />
                                            <Text style={style.h5}> Change Password</Text>
                                        </View>
                                        <Icon name='angle-right' color='#fa4969' size={15} />
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.info}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon name='share' color='#7d6eff' size={20} style={{ marginRight: 5 }} />
                                        <Text style={style.h5}>Share</Text>
                                    </View>
                                    <Icon name='angle-right' color='#fa4969' size={15} />
                                </View>
                            </View>

                            <View>
                                <Button
                                    title='Save'
                                    titleStyle={{ fontSize: 14 }}
                                    buttonStyle={[style.button, { alignSelf: 'center' }]}
                                    onPress={() => this.setState({ errors: [] }, this.updateUser.bind(this))}
                                // disabled={this.state.loading}
                                />
                                <Button
                                    title='Sign Out'
                                    titleStyle={{ fontSize: 14 }}
                                    buttonStyle={[style.button, { alignSelf: 'center' }]}
                                    onPress={this.logout.bind(this)}
                                />
                            </View>
                        </ScrollView>
                    </View>

                </View>
                <View style={{ height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', textAlign: 'center' }}>
                    <ActivityIndicator animating={this.state.loading} size="large" color="#fff" />
                    {!this.state.connection &&
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', marginHorizontal: 50, padding: 10, borderRadius: 10 }}>
                            <Text style={{ textAlign: 'center' }}>There was a problem fetching your profile data. Please try again later</Text>
                        </View>
                    }
                </View>
                </View>
            </TouchableWithoutFeedback >

        )
    }
}

const styles = StyleSheet.create({
    info: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333957'
    }
});