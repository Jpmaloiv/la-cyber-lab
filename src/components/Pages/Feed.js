import React from 'react'
import { Image, Text, ScrollView, StyleSheet, View } from 'react-native'
import { Divider } from 'react-native-elements'
import * as rssParser from 'react-native-rss-parser';
import HTMLView from 'react-native-htmlview';
import moment from 'moment'
import style from '../../../style'


export default class Feed extends React.Component {
    constructor() {
        super()
        this.state = {
            rss: []
        }
    }

    componentDidMount() {
        return fetch('https://www.us-cert.gov/ncas/current-activity.xml')
            .then((response) => response.text())
            .then((responseData) => rssParser.parse(responseData))
            .then((rss) => {
                console.log(rss.items)
                this.setState({ rss: rss.items })
            });
    }

    filterHTML(desc) {
        const filteredDesc = desc.replace(' ', '').replace('<br/>', '').replace('<br />', '')
        console.log(filteredDesc)
        return filteredDesc
    }


    render() {

        const images = [
            require('../../../assets/images/stock/1.jpeg'),
            require('../../../assets/images/stock/2.jpg'),
            require('../../../assets/images/stock/3.jpg')
        ]

        return (
            <View>
                <View style={style.header}>
                    <Text style={style.h1}>News Feed</Text>
                    <Text style={style.h4}>Read the latest cyber threat news</Text>
                </View>
                <View>
                    <ScrollView>
                        {this.state.rss.map((item, index) => (
                            <View>
                                <View style={[style.body, {flexDirection: 'row', justifyContent: 'space-between'}]}>
                                    <View>
                                        <Text style={style.h3}>{item.title}</Text>
                                        <Text style={style.h6}>{moment(item.published).fromNow()}</Text>
                                    </View>
                                    <Image source={require('../../../assets/images/share.png')} />
                                </View>
                                <Image source={index < 3 ? images[index] : ''} style={{ width: '100%', height: 200}} />
                                <View style={style.body}>
                                    <HTMLView
                                        value={this.filterHTML(item.description)}
                                        addLineBreaks={false}
                                        stylesheet={richTextStyles}
                                    />
                                </View>
                                <Divider style={{ height: 16, backgroundColor: '#232947' }} />
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const richTextStyles = StyleSheet.create({
    p: {
        marginBottom: -20
    },
    ul: {
        marginTop: -20,
        marginBottom: -20
    },
    div: {
        marginTop: -20,
        marginBottom: -70
    }
})