import React from 'react'
import constants from '../../../constants'
import { Alert, AsyncStorage, Image, TouchableOpacity, View } from 'react-native'
import { Button, Text } from 'react-native-elements'
import axios from 'axios'
import style from '../../../style'


export default class Error extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }



    

    render() {

        return (
            <View style={[style.body, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={style.h2}>Error Page</Text>
            </View>
        )
    }
}