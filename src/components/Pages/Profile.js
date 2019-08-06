import React from 'react'
import { Alert, AsyncStorage, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Button, Input} from 'react-native-elements';
import axios from 'axios'
import Icon from 'react-native-vector-icons/FontAwesome';
import style from '../../../style'


export default class Profile extends React.Component {
    constructor() {
        super()
        this.state = { emails: [] }
    }

    componentDidMount() { this.getProfile() }

    async getProfile() {

        const email = await AsyncStorage.getItem('email')
        axios.get(`${global.BASE_URL}/users/profile?email=${email}`,
            { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                console.log(resp)
                const { userProfile } = resp.data[0]

                this.setState({
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                    oldEmail: resp.data[0].registeredEmail,
                    email: resp.data[0].registeredEmail
                })
            })
            .catch(err => console.error(err))

        axios.get(`${global.BASE_URL}/users/profile/sector?email=${email}`,
            { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
            .then(resp => {
                console.log(resp)
            })
            .catch(err => console.error(err))


    }

    toHexString(byteArray) {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
    }

    logout() {
        AsyncStorage.clear()
        this.props.navigation.navigate('Welcome')
    }

    async updateUser() {

        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email)) {
            await axios.post(`${global.BASE_URL}/users/edit/user?email=${this.state.oldEmail}`, {
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email
            })
                .then(resp => {
                    console.log(resp)
                    AsyncStorage.setItem('email', this.state.email)
                })
                .catch(err => console.error(err))



            for (var i = 0; i < this.state.emails.length; i++) {
                try {
                    await axios.post(`${global.BASE_URL}/users/add/email?email=${this.state.oldEmail}`, {
                        email: this.state.emails[i]
                    })
                        .then(resp => console.log(resp))
                    if (i === params.industries.length - 1) {
                        console.log("DONE!")
                        this.props.navigation.navigate('Home')
                    }
                }
                catch { err => console.error(err) }
            }

            Alert.alert(
                'Profile updated!',
                'Changes are reflected immediately',
                [{ text: 'OK' }],
                { cancelable: false },
            );

            this.setState({ error: null})
            this.getProfile();
        } else {
            console.log("ERR")
            this.setState({ error: 'Please enter a valid email address'})
        }
    }


    addEmail() {
        this.state.emails.push('Enter email address')
        this.setState({ render: !this.state.render })
        // console.log(this.state.emails)

        // this.setState({ emails: this.state.emails.push('hi')})
    }
    render() {

        const { emails } = this.state

        // Seed data
        industriesNum = 3

        return (
            <View style={{ flex: 1 }}>
                <View style={style.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={style.h1}>My Account</Text>
                        <Icon name='bell' color='#fff' size={30} />
                    </View>
                    <Text style={style.h6}>Set up your account</Text>
                </View>
                <View style={[style.body, { flex: 1 }]}>
                    <ScrollView>
                        <View style={{ marginBottom: 20 }}>
                            <Text style={style.h3}>Profile Name</Text>
                            <TouchableOpacity style={styles.info} onPress={() => this.firstName.focus()}>
                                <Text style={style.h5}>First Name</Text>
                                <TextInput
                                    ref={input => this.firstName = input}
                                    style={[style.p, { color: '#fff' }]}
                                    value={this.state.firstName}
                                    onChangeText={firstName => this.setState({ firstName })}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.info} onPress={() => this.lastName.focus()}>
                                <Text style={style.h5}>Last Name</Text>
                                <TextInput
                                    ref={input => this.lastName = input}
                                    style={[style.p, { color: '#fff' }]}
                                    value={this.state.lastName}
                                    onChangeText={lastName => this.setState({ lastName })}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={style.h3}>Registered Emails</Text>
                            <TouchableOpacity style={[styles.info, {alignItems: 'center', paddingVertical: 0}]} onPress={() => this.email.focus()}>
                                <Input
                                    ref={input => this.email = input}
                                    inputStyle={[style.p, { color: '#fff'}]}
                                    containerStyle={{flex: 1, paddingHorizontal: 0}}
                                    inputContainerStyle={{ borderBottomWidth: 0}}
                                    placeholder={this.state.oldEmail}
                                    placeholderTextColor='#707992'
                                    autoCapitalize='none'
                                    onChangeText={email => this.setState({ email })}
                                />
                                <Text style={style.p}>Edit Email</Text>
                            </TouchableOpacity>
                            <Text style={{display: this.state.error ? 'flex' : 'none', color: 'red', fontSize: 12, marginVertical: 5}}>Please enter a valid email address</Text>
                            {/* Additional user emails */}
                            {emails.map(el => (
                                <View style={styles.info}>
                                    <TextInput
                                        placeholder={el}
                                        placeholderTextColor='#707992'
                                        autoCapitalize='none'
                                        style={{color: '#fff'}}
                                    />
                                </View>

                            ))}
                            <TouchableOpacity style={{ flexDirection: 'row', paddingVertical: 15 }} onPress={this.addEmail.bind(this)}>
                                <Icon name='plus-circle' color='#fa4969' size={15} style={{ marginRight: 5 }} />
                                <Text style={{ color: '#fa4969', fontSize: 12, fontWeight: '500' }}>ADD ANOTHER EMAIL</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={style.h3}>Settings</Text>
                            <View style={styles.info}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name='building' color='#f5bd00' size={20} style={{ marginRight: 5 }} />
                                    <Text style={style.h5}>Industries</Text>
                                </View>
                                <Text style={style.p}>{industriesNum} Selected  <Icon name='angle-right' color='#fa4969' size={15} /></Text>
                            </View>
                            <View style={styles.info}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name='lock' color='#49fa69' size={20} style={{ marginRight: 5 }} />
                                    <Text style={style.h5}>Change Password</Text>
                                </View>
                                <Icon name='angle-right' color='#fa4969' size={15} />
                            </View>
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
                                onPress={this.updateUser.bind(this)}
                            />
                            <TouchableOpacity
                                onPress={this.logout.bind(this)}
                            ><Text>Sign Out</Text></TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>

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