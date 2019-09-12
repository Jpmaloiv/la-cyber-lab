
import React, { Component } from 'react';
import constants from '../../../constants'
import { Alert,  Text,Keyboard, TouchableOpacity,TouchableWithoutFeedback, View } from 'react-native'
import { Button, Input } from 'react-native-elements'
import IconAnt from 'react-native-vector-icons/AntDesign'
import IconFeather from 'react-native-vector-icons/Feather'
import style from '../../../style'
import axios from 'axios';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"


export default class CreateAccount extends Component {
    constructor(props) {
        super(props)
        this.state = { validation: false, isFocused: {} }
    }

    static navigationOptions = ({ navigation }) => {
        return {
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <IconAnt name='arrowleft' color='#fff' size={30} />
                </TouchableOpacity>
            ),
            headerRight: (
                <Button title='SIGN IN' buttonStyle={[style.button, { width: 73, height: 26, padding: 0, margin: 0 }]} titleStyle={{ fontSize: 12, fontWeight: '900' }} onPress={() => navigation.navigate('SignIn')} />
            )
        }
    }

    // Validate that email isn't already registered
    async validateNewEmail() {
        let validation = await axios.get(`${constants.BASE_URL}/auth/validate?registeredProfileEmail=${this.state.email}`)
            .then(resp => {
                console.log("RESP", resp)
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
                'Please sign in or choose a different email',
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
        else {
            this.setState({ validation: true })
        }
        this.confirmEmail.clear()
    }

    // Checks if email addresses match, navigates to next screen
    next() {
        if (this.state.email === this.state.confirmEmail) {

            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email)) {
                this.props.navigation.navigate('CreatePassword', {
                    firstName: this.state.firstName,
                    lastName: this.state.lastName,
                    email: this.state.email
                })
            } else {
                this.setState({ error: 'Please enter a valid email format' })
            }
        }
        else this.setState({ error: 'Email addresses do not match' })
    }

    componentDidUpdate() {
        if (this.state.email === this.state.confirmEmail && this.state.error && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email)) this.setState({ error: '' })
    }

    render() {

        return (

                <KeyboardAwareScrollView enableOnAndroid accessible={false} >
                <View style={[style.body, { flex: 1, paddingBottom: 25 }]} behavior='height' enabled>
                <View style={{ marginBottom: 15 }}>
                    <Text style={style.h1}>Let's Create</Text>
                    <Text style={style.h1}>Your Account</Text>
                </View>
                <View >
                    <Input
                        ref={input => this.firstName = input}
                        containerStyle={{ marginVertical: 8, paddingHorizontal: 0 }}
                        inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }}
                        inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                        placeholder='First Name'
                        placeholderTextColor='#707992'
                        onFocus={() => this.setState({ focusFn: true })}
                        onBlur={() => this.setState({ focusFn: false })}
                        onChangeText={firstName => this.setState({ firstName })}
                        rightIcon={<TouchableOpacity style={!(this.state.firstName && this.state.focusFn) && { display: 'none' }}><IconFeather name='x-circle' onPress={() => this.setState({ firstName: null }, this.firstName.clear())} color='#fa4969' size={15} style={{ paddingRight: 15 }} /></TouchableOpacity>}
                    />
                    <Input
                        ref={input => this.lastName = input}
                        containerStyle={{ marginVertical: 8, paddingHorizontal: 0 }}
                        inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }} asd
                        inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                        placeholder='Last Name'
                        placeholderTextColor='#707992'
                        onFocus={() => this.setState({ focusLn: true })}
                        onBlur={() => this.setState({ focusLn: false })}
                        onChangeText={lastName => this.setState({ lastName })}
                        rightIcon={<TouchableOpacity style={!(this.state.lastName && this.state.focusLn) && { display: 'none' }}><IconFeather name='x-circle' onPress={() => this.setState({ lastName: null }, this.lastName.clear())} color='#fa4969' size={15} style={{ paddingRight: 15 }} /></TouchableOpacity>}
                    />

                    <Input
                        containerStyle={{ marginVertical: 8, paddingHorizontal: 0 }}
                        inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }}
                        inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                        placeholder='Enter Email Address'
                        placeholderTextColor='#707992'
                        autoCapitalize='none'
                        onChangeText={email => this.setState({ email, validation: false })}
                        rightIcon={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email) && <TouchableOpacity><IconAnt name='checkcircleo' color='#f5bd00' size={18} style={{ paddingRight: 15 }} /></TouchableOpacity>}
                    />
                    <Input
                        ref={input => this.confirmEmail = input}
                        containerStyle={{ marginVertical: 8, paddingHorizontal: 0 }}
                        inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }}
                        inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                        placeholder='Confirm Email Address'
                        placeholderTextColor='#707992'
                        autoCapitalize='none'
                        onChangeText={(confirmEmail) => { this.state.validation && this.state.email ? this.setState({ confirmEmail }) : this.validateNewEmail() }}
                        rightIcon={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.confirmEmail) && <TouchableOpacity><IconAnt name='checkcircleo' color='#f5bd00' size={18} style={{ paddingRight: 15 }} /></TouchableOpacity>}
                        errorMessage={this.state.error}
                    />
                </View>


                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <Button
                        title="NEXT"
                        titleStyle={{ fontSize: 15, fontWeight: '900' }}
                        buttonStyle={[style.button, { height: 55, width: '100%', alignSelf: 'center' }]}
                        onPress={this.next.bind(this)}
                        disabled={!this.state.firstName || !this.state.lastName || !this.state.email || !this.state.confirmEmail}
                        disabledStyle={{ backgroundColor: '#fa496975' }}
                    />
                </View>
                </View>
            </KeyboardAwareScrollView>
        );
    }
}
