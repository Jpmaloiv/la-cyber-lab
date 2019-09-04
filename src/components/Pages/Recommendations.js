import React from 'react'
import { Dimensions, Image, View } from 'react-native'
import { Divider, Text } from 'react-native-elements'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import style from '../../../style'


export default class Recommendations extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeSlide: 0,
            sliderWidth: Dimensions.get('window').width
        }
    }

    renderItem({ item, index }) {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', height: 91, marginVertical: 15, borderRadius: 5, backgroundColor: '#313961', justifyContent: 'space-around', alignItems: 'center' }}>
                    <Text style={style.h3}>THREAT LEVEL</Text>

                    <Image source={item.src} />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 34, height: 34, margin: 10, marginLeft: 0, backgroundColor: '#33333A', borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#f5bd00', fontWeight: 'bold' }}>1</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text>Don't open any email that you may feel suspicious about.</Text>
                    </View>

                </View>
                <Divider style={{ height: 1, backgroundColor: '#737589' }} />

                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 34, height: 34, margin: 10, marginLeft: 0, backgroundColor: '#33333A', borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#f5bd00', fontWeight: 'bold' }}>2</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text>Only connect to private wifi that you trust.</Text>
                        </View>
                    </View>
                </View>
                <Divider style={{ height: 1, backgroundColor: '#737589' }} />

                <View style={{ maxWidth: '100%' }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center' }}>
                        <View style={{ width: 34, height: 34, margin: 10, marginLeft: 0, backgroundColor: '#33333A', borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#f5bd00', fontWeight: 'bold' }}>3</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text>Check the URLs of any financial accounts you open from an email</Text>
                        </View>
                    </View>
                </View >
            </View>
        )
    }
    render() {

        const entries = [{ src: require('../../../assets/images/threat-high.png') }, { src: require('../../../assets/images/threat-guarded.png') }]

        return (
            <View style={[style.body, { flex: 1, justifyContent: 'center' }]}>
                <Text style={[style.h3, { alignSelf: 'center' }]}>Recommendations</Text>

                <View style={[style.body, { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 0 }]}>
                    <Carousel
                        ref={ref => this.carouselRef = ref}
                        data={entries}
                        renderItem={this.renderItem}
                        sliderWidth={this.state.sliderWidth}
                        onSnapToItem={index => this.setState({ activeSlide: index })}
                        itemWidth={this.state.sliderWidth * .91}
                        removeClippedSubviews={false}
                        
                    // inactiveSlideOpacity={0}
                    // inactiveSlideScale={0.75}
                    />
                    <Pagination
                        dotsLength={entries.length}
                        activeDotIndex={this.state.activeSlide}
                        dotStyle={{
                            width: 7,
                            // height: 7,
                            borderRadius: 5,
                            backgroundColor: '#fa4969'
                        }}
                        dotContainerStyle={{ marginHorizontal: 2 }}
                        tappableDots={!!this.carouselRef}
                        carouselRef={this.carouselRef}
                        inactiveDotStyle={{ backgroundColor: '#575a6f' }}
                        inactiveDotScale={1}
                        inactiveDotOpacity={1}
                    />
                </View>
            </View>

        )
    }
}