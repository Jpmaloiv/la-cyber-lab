import React from 'react'
import { Text, View } from 'react-native'
import { Button, CheckBox } from 'react-native-elements'
import style from '../../../style'


export default class AccountType extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        return (
            <View style={style.body}>
                <Text style={[style.h2, { marginBottom: 20 }]}>What Type of Account is This?</Text>
                <CheckBox
                    right
                    iconRight
                    title={<View style={{  flex:1, padding: 25, alignItems:"center",alignSelf:"center"}}>
                        <Text style={style.h3}>Business</Text>
                    </View>}
                    containerStyle={{ alignContent:"space-between", backgroundColor: 'transparent' }}
                    // textStyle={{ color: '#fff' }}
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checked={this.state.accountType === 'business'}
                    onPress={() => this.setState({ accountType: 'business' })}
                >
                </CheckBox>

                <CheckBox
                    right
                    iconRight
                    title={<View style={{ flex:1, padding: 25, alignItems:"center"}}>
                        <Text style={style.h3}>Personal</Text>
                        <Text></Text>
                    </View>}
                    containerStyle={{ backgroundColor: 'transparent' }}
                    // textStyle={{ color: '#fff' }}
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checked={this.state.accountType === 'personal'}
                    onPress={() => this.setState({ accountType: 'personal' })}
                >
                </CheckBox>

                <Button
                    title="NEXT"
                    titleStyle={{ fontSize: 14 }}
                    buttonStyle={[style.button, { alignSelf: 'center' }]}
                    onPress={() => {
                        this.state.accountType === 'personal' ? this.props.navigation.state.params.industries = [1] : []
                        this.state.accountType === 'business' ? this.props.navigation.navigate('IndustrySelect', this.props.navigation.state.params) : this.props.navigation.navigate('LocationSelect', this.props.navigation.state.params)
                    }
                    }
                    disabled={!this.state.accountType}
                    disabledStyle={{backgroundColor: '#fa496975'}}

                />
            </View>
        )
    }
}