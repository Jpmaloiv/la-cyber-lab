
import React, { Component } from 'react';
import { Linking, Text, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { Button, CheckBox, Input } from 'react-native-elements'
import constants from '../../../constants'
import IconAnt from 'react-native-vector-icons/AntDesign'
import IconFeather from 'react-native-vector-icons/Feather'
import style from '../../../style'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"


export default class CreatePassword extends Component {
    constructor(props) {
        super(props)
        this.state = {}
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

    next() {
        if (this.state.password === this.state.confirmPw) {
            let { params } = this.props.navigation.state
            params.password = this.state.password
            this.props.navigation.navigate('AccountType', params)
        }
        else this.setState({ error: 'Passwords do not match' })
    }


    render() {

        if (this.state.password === this.state.confirmPw && this.state.error) this.setState({ error: '' })

        return (

            <KeyboardAwareScrollView
                enableOnAndroid
                contentContainerStyle={[style.body, { flexGrow: 1 }]} keyboardShouldPersistTaps='always'>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >

                    <View style={{ flex: 1 }}>
                        <View style={{ marginBottom: 15 }}>
                            <Text style={style.h1}>Let's Create</Text>
                            <Text style={style.h1}>Your Password</Text>
                        </View>
                        <Input
                            ref={input => this.password = input}
                            placeholder='Create Password'
                            placeholderTextColor='#707992'
                            onFocus={() => this.setState({ focusPw: true })}
                            onBlur={() => this.setState({ focusPw: false })}
                            containerStyle={{ marginVertical: 5, paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }}
                            inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                            secureTextEntry
                            onChangeText={password => this.setState({ password })}
                            autoCapitalize='none'
                            rightIcon={<TouchableOpacity style={!(this.state.password && this.state.focusPw) && { display: 'none' }}><IconFeather name='x-circle' onPress={() => this.setState({ password: null }, this.password.clear())} color='#fa4969' size={15} style={{ paddingRight: 15 }} /></TouchableOpacity>}

                        />
                        <Input
                            ref={input => this.confirmPw = input}
                            placeholder='Confirm Password'
                            placeholderTextColor='#707992'
                            onFocus={() => this.setState({ focusCpw: true })}
                            onBlur={() => this.setState({ focusCpw: false })}
                            containerStyle={{ marginVertical: 5, paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }}
                            inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                            secureTextEntry
                            onChangeText={confirmPw => this.setState({ confirmPw })}
                            autoCapitalize='none'
                            rightIcon={<TouchableOpacity style={!(this.state.confirmPw && this.state.focusCpw) && { display: 'none' }}><IconFeather name='x-circle' onPress={() => this.setState({ confirmPw: null }, this.confirmPw.clear())} color='#fa4969' size={15} style={{ paddingRight: 15 }} /></TouchableOpacity>}
                            errorMessage={this.state.error}
                        />

                        <View style={{ margin: 10 }}>
                            <Text style={style.h3}>Password must include:</Text>
                            <View style={{ backgroundColor: '#202642', borderRadius: 5, paddingHorizontal: 15, paddingVertical: 8, marginVertical: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                                    <Text style={[{ fontSize: 15, fontWeight: '500', color: '#707992' }, this.state.password && (this.state.password.length > 7 ? { color: '#707992' } : { color: '#fa4969' })]}>At least 8 characters</Text>
                                    <Text>{this.state.password && (this.state.password.length > 7 ? <IconAnt name='checkcircleo' color='#f5bd00' size={18} /> : <IconFeather name='x-circle' color='#fa4969' size={18} />)}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                                    <Text style={[{ fontSize: 15, color: '#707992', fontWeight: '500' }, this.state.password && (/[A-Z]/.test(this.state.password) ? { color: '#707992' } : { color: '#fa4969' })]}>At least 1 capital letter</Text>
                                    <Text>{this.state.password && (/[A-Z]/.test(this.state.password) ? <IconAnt name='checkcircleo' color='#f5bd00' size={18} /> : <IconFeather name='x-circle' color='#fa4969' size={18} />)}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                                    <Text style={[{ fontSize: 15, color: '#707992', fontWeight: '500' }, this.state.password && (/\d/.test(this.state.password) ? { color: '#707992' } : { color: '#fa4969' })]}>At least 1 numeric value</Text>
                                    <Text>{this.state.password && (/\d/.test(this.state.password) ? <IconAnt name='checkcircleo' color='#f5bd00' size={18} /> : <IconFeather name='x-circle' color='#fa4969' size={18} />)}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                                    <Text style={[{ fontSize: 15, color: '#707992', fontWeight: '500' }, this.state.password && (/[_\W]/.test(this.state.password) ? { color: '#707992' } : { color: '#fa4969' })]}>At least 1 special character</Text>
                                    <Text>{this.state.password && (/[_\W]/.test(this.state.password) ? <IconAnt name='checkcircleo' color='#f5bd00' size={18} /> : <IconFeather name='x-circle' color='#fa4969' size={18} />)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <CheckBox
                                    center
                                    size={25}
                                    containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 0, marginHorizontal: 0 }}
                                    uncheckedIcon={<View style={{ borderWidth: 2, borderColor: "#FFF", backgroundColor: '#202642', height: 25, width: 25, borderRadius: 3 }} />}
                                    checked={this.state.checked}
                                    onPress={() => this.setState({ checked: !this.state.checked })}
                                />
                                <TouchableOpacity onPress={() => Linking.openURL(constants.PRIVACY_POLICY_LINK).catch((err) => console.log('Error opening extenal link to Privacy Policy', err))}>
                                    <Text style={{ fontSize: 12 }}>I Agree with the LA Cyber Lab <Text style={{ color: '#fa4969', fontWeight: 'bold' }}>Terms</Text> & <Text style={{ color: '#fa4969', fontWeight: 'bold' }}>Conditions</Text></Text>
                                </TouchableOpacity>
                            </View>
                            <Button
                                title='SUBMIT'
                                titleStyle={{ fontSize: 15, fontWeight: '900' }}
                                buttonStyle={[style.button, { height: 55, width: '100%', alignSelf: 'center' }]}
                                disabled={!this.state.checked || !this.state.password || !this.state.confirmPw}
                                disabledStyle={{ backgroundColor: '#fa496975' }}
                                // Checks if passwords match
                                onPress={this.state.password === this.state.confirmPw
                                    ? this.next.bind(this)
                                    : () => this.setState({ error: 'Passwords do not match' })
                                }
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAwareScrollView >

        );
    }

}