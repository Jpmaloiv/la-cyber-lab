
import React from 'react';
import { ScrollView, Text, View } from 'react-native'
import { Button, CheckBox } from 'react-native-elements'
import style from '../../../style'
import axios from 'axios';


export default class IndustrySelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            industries: [],
            sectors: []
        }
    }

    componentDidMount() {
        axios.get(`${global.BASE_URL}/users/sectors`)
            .then(resp => {
                console.log(resp)
                let sectors = []
                for (var i = 0; i < resp.data.length; i++) {
                    sectors.push(resp.data[i].sectorDescription)
                }

                this.setState({ sectors: sectors })
            })
            .catch(err => console.error(err))
    }

    next() {
        let { params } = this.props.navigation.state
        params.industries = this.state.industries
        this.props.navigation.navigate('LocationSelect', params)
    }

    render() {
        const { industries, sectors } = this.state

        return (
            <View style={[style.body, { flex: 1, marginBottom: 50 }]}>
                <Text style={[style.h3, {marginVertical: 5}]}>What industry are you in?</Text>
                <Text style={[style.h5, {marginVertical: 5}]}>Select All That Apply</Text>
                <ScrollView>

                    {sectors.map((el, i) =>
                        <CheckBox
                            center
                            title={el}
                            containerStyle={{backgroundColor: 'transparent'}}
                            textStyle={{color: '#fff'}}
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={industries.includes(i + 1)}
                            // Toggles industry selection up to 3 choices
                            onPress={() => {
                                industries.includes(i + 1)
                                    ? industries.splice(industries.indexOf(i + 1), 1)
                                    : industries.length != 3 && industries.push(i + 1),
                                    this.setState({ render: !this.state.render })
                            }}

                        />
                    )}


                </ScrollView>

                <Button
                    title="NEXT"
                    titleStyle={{ fontSize: 14 }}
                    buttonStyle={[style.button, { alignSelf: 'center' }]}
                    onPress={this.next.bind(this)}
                />

            </View>
        );
    }

}