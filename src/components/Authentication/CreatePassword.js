
import React, { Component } from 'react';
import { Text, View } from 'react-native'
import { Button, CheckBox, Input } from 'react-native-elements'
import style from '../../../style'


export default class CreatePassword extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    next() {
        if (this.state.password === this.state.confirmPw) {
            let { params } = this.props.navigation.state
            params.password = this.state.password
            this.props.navigation.navigate('IndustrySelect', params)
        }
        else this.setState({ error: 'Passwords do not match' })
    }


    render() {

        if (this.state.password === this.state.confirmPw && this.state.error) this.setState({ error: '' })

        return (
            <View style={[style.body, { flex: 1, justifyContent: 'center' }]}>
                <Text style={{ fontSize: 20, marginBottom: 15 }}>Create a password</Text>
                <Text style={style.h6}>Password</Text>
                <Input
                    placeholder='Create Password'
                    placeholderTextColor='#707992'
                    inputStyle={{ color: '#fff' }}
                    secureTextEntry
                    onChangeText={password => this.setState({ password })}
                    autoCapitalize='none'
                />
                <Input
                    placeholder='Confirm Password'
                    placeholderTextColor='#707992'
                    inputStyle={{ color: '#fff' }}
                    secureTextEntry
                    onChangeText={confirmPw => this.setState({ confirmPw })}
                    autoCapitalize='none'
                    errorMessage={this.state.error}
                />
                <View style={{margin: 10}}>
                    <Text style={style.h6}>Password must include:</Text>
                    <Text style={style.h7}>At least 8 characters</Text>
                    <Text style={style.h7}>At least 1 capital letter</Text>
                    <Text style={style.h7}>At least 1 numeric value</Text>
                    <Text style={style.h7}>At least 1 special character</Text>
                </View>

                <CheckBox
                    center
                    containerStyle={{backgroundColor: 'transparent', borderWidth: 0}}
                    textStyle={{color: '#fff'}}
                    title='I Agree with the LA Cyber Lab Terms & Conditions'
                    checked={this.state.checked}
                    onPress={() => this.setState({ checked: !this.state.checked })}
                />

                <Button
                    title="Submit"
                    titleStyle={{ fontSize: 14 }}
                    buttonStyle={[style.button, {alignSelf: 'center'}]}
                    // Checks if passwords match
                    onPress={this.state.password === this.state.confirmPw
                        ? this.next.bind(this)
                        : () => this.setState({ error: 'Passwords do not match' })
                    }
                />
            </View>
        );
    }

}