import React from 'react'
import constants from '../../../constants'
import { Alert, TouchableOpacity, View } from 'react-native'
import { Button, Input, Text } from 'react-native-elements'
import IconAnt from 'react-native-vector-icons/AntDesign'
import IconFeather from 'react-native-vector-icons/Feather'
import style from '../../../style'
import axios from 'axios';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"


export default class ResetPassword extends React.Component {
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

    async resetPassword() {

        if (this.state.password === this.state.confirmPw) {
            axios.put(`${constants.BASE_URL}/auth/reset/password?registeredProfileEmail=&userProfileId=${this.props.navigation.state.params.userProfileId}`, {
                newPassword: this.state.password
            }, { headers: { 'Authorization': this.props.navigation.state.params.token } })
                .then(resp => {
                    console.log(resp.data)
                    Alert.alert(
                        'Password updated',
                        'Please log in',
                        [{ text: 'OK', onPress: () => this.props.navigation.navigate('SignIn') }],
                        { cancelable: false },
                    );

                })
                .catch(err => console.log(err))
        } else {
            this.setState({ error: 'Passwords do not match' })
        }
    }

    render() {

        return (
            <KeyboardAwareScrollView contentContainerStyle={[style.body, { flexGrow: 1 }]} enableOnAndroid accessible={false} >
                <View style={{ flex: 1 }}>
                    <Text style={[style.h1, { marginBottom: 15 }]}>Reset Password</Text>
                    <Input
                        ref={input => this.password = input}
                        containerStyle={{ marginVertical: 8, paddingHorizontal: 0 }}
                        inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }}
                        inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                        placeholder='New Password'
                        placeholderTextColor='#707992'
                        autoCapitalize='none'
                        secureTextEntry
                        onFocus={() => this.setState({ focusPw: true })}
                        onBlur={() => this.setState({ focusPw: false })}
                        onChangeText={password => this.setState({ password })}
                        // rightIcon={<TouchableOpacity style={!(this.state.password && this.state.focusPw) && { display: 'none' }}><IconFeather name='x-circle' onPress={() => this.setState({ password: null }, this.password.clear())} color='#fa4969' size={15} style={{ paddingRight: 15 }} /></TouchableOpacity>}
                    />
                    <Input
                        ref={input => this.confirmPw = input}
                        containerStyle={{ marginVertical: 8, paddingHorizontal: 0 }}
                        inputContainerStyle={{ borderWidth: 1, borderColor: '#707992', borderRadius: 5 }}
                        inputStyle={{ color: '#fff', fontSize: 15, padding: 15 }}
                        placeholder='Confirm New Password'
                        placeholderTextColor='#707992'
                        autoCapitalize='none'
                        secureTextEntry
                        onFocus={() => this.setState({ focusCpw: true })}
                        onBlur={() => this.setState({ focusCpw: false })}
                        onChangeText={confirmPw => this.setState({ confirmPw })}
                        // rightIcon={<TouchableOpacity style={!(this.state.confirmPw && this.state.focusCpw) && { display: 'none' }}><IconFeather name='x-circle' onPress={() => this.setState({ confirmPw: null }, this.confirmPw.clear())} color='#fa4969' size={15} style={{ paddingRight: 15 }} /></TouchableOpacity>}
                        errorMessage={this.state.error}
                    />

                    <View style={{ margin: 10 }}>
                        <Text style={style.h3}>Password must include:</Text>
                        <View style={{ backgroundColor: '#202642', borderRadius: 5, padding: 15, marginVertical: 15 }}>
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
                        <Button
                            title="RESET PASSWORD"
                            titleStyle={{ fontSize: 15, fontWeight: '900' }}
                            buttonStyle={[style.button, { height: 55, width: '100%', alignSelf: 'center' }]}
                            onPress={this.resetPassword.bind(this)}
                            disabled={!this.state.password || !this.state.confirmPw}
                            disabledStyle={{ backgroundColor: '#fa496975' }}
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>
        )
    }
}