// Disable development warning messages
console.disableYellowBox = true

import React from 'react';
import constants from './constants'
import NotificationPopup from 'react-native-push-notification-popup';
import { registerRootComponent } from 'expo';
import { ActivityIndicator, Alert, AsyncStorage, ErrorUtils, Image, Platform, StatusBar, Text, View } from 'react-native'
import { ErrorRecovery, Linking, Notifications } from 'expo';
import * as Sentry from 'sentry-expo';
import * as Permissions from 'expo-permissions'
import { createStackNavigator, createAppContainer, createSwitchNavigator, createBottomTabNavigator, NavigationActions } from 'react-navigation';
import { setCustomText } from 'react-native-global-props'
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios'
import style from './style'

import Welcome from './src/components/Authentication/Welcome'
import CreateAccount from './src/components/Authentication/CreateAccount'
import CreatePassword from './src/components/Authentication/CreatePassword'
import AccountType from './src/components/Authentication/AccountType'
import IndustrySelect from './src/components/Authentication/IndustrySelect'
import LocationSelect from './src/components/Authentication/LocationSelect'
import SignIn from './src/components/Authentication/SignIn'
import Verification from './src/components/Authentication/Verification'

import ChangePassword from './src/components/Authentication/ChangePassword'
import ResetPassword from './src/components/Authentication/ResetPassword'
import ChangeIndustries from './src/components/Pages/ChangeIndustries'

import Home from './src/components/Pages/Home'
import Threats from './src/components/Pages/Threats'
import Email from './src/components/Pages/Email'
import Feed from './src/components/Pages/Feed'
import Profile from './src/components/Pages/Profile'

import Recommendations from './src/components/Pages/Recommendations'
import RecommendationActions from './src/components/Pages/RecommendationActions'

import Error from './src/components/Errors/Error'

import store from './src/redux/store';
import { Provider } from "react-redux";

// Base URL endpoint and auth token
// global.BASE_URL = 'http://la-cyberlab-dev.herokuapp.com'
// global.AUTHORIZATION_TOKEN = 'bearer 12345'

// let verifyLink= Linking.makeUrl('verify/email')
// console.log("VERIFY LINK", verifyLink)

// console.log("PROPS", this.props)

// ErrorRecovery.setRecoveryProps('error') 

// Navigation
const AuthStack = createStackNavigator({
  Welcome,
  CreateAccount,
  CreatePassword,
  AccountType,
  IndustrySelect,
  LocationSelect,
  SignIn,
  ResetPassword
}, {
  defaultNavigationOptions: {
    headerStyle: {
      borderBottomWidth: 0,
      backgroundColor: '#232947', marginHorizontal: 25, marginTop: 10, elevation: 0
    },
    headerTintColor: '#fff'
  },
  // ? Not sure why this needs to be set, not receiving App style
  cardStyle: {
    backgroundColor: '#242947'
  }
})

const VerificationStack = createStackNavigator({
  Verification
}, {
  defaultNavigationOptions: {
    headerStyle: {
      borderBottomWidth: 0,
      backgroundColor: '#232947', marginHorizontal: 30, marginTop: 10, elevation: 0
    },
    headerTintColor: '#fff'
  },
  cardStyle: {
    backgroundColor: '#242947'
  }
})

const HomeStack = createStackNavigator({
  Home,
  RecommendationActions
}, {
  defaultNavigationOptions: {
    headerStyle: {
      borderBottomWidth: 0,
      backgroundColor: '#232947', marginHorizontal: 25, elevation: 0
    },
    headerTintColor: '#fff'
  },
  cardStyle: {
    backgroundColor: '#242947'
  }
})

const EmailStack = createStackNavigator({
  Email
}, {
  defaultNavigationOptions: {
    headerStyle: {
      borderBottomWidth: 0,
      backgroundColor: '#232947', elevation: 0
    },
    headerTintColor: '#fff'
  },
  cardStyle: {
    backgroundColor: '#242947'
  }
})

const ThreatsStack = createStackNavigator({
  Threats,
  Recommendations
}, {
  defaultNavigationOptions: {
    headerStyle: {
      borderBottomWidth: 0,
      backgroundColor: '#232947', marginHorizontal: 25, elevation: 0
    },
    headerTintColor: '#fff'
  },
  cardStyle: {
    backgroundColor: '#242947'
  }
})

const FeedStack = createStackNavigator({
  Feed
}, {
  defaultNavigationOptions: {
    headerStyle: {
      borderBottomWidth: 0,
      backgroundColor: '#232947', elevation: 0
    },
    headerTintColor: '#fff'
  },
  cardStyle: {
    backgroundColor: '#242947'
  }
})

const ProfileStack = createStackNavigator({
  Profile,
  ChangePassword,
  ChangeIndustries
}, {
  defaultNavigationOptions: {
    headerStyle: {
      borderBottomWidth: 0,
      backgroundColor: '#232947', marginHorizontal: 25, elevation: 0
    },
    headerTintColor: '#fff'
  },
  // ? Not sure why this needs to be set, not receiving App style
  cardStyle: {
    backgroundColor: '#242947'
  }
})

const DashStack = createBottomTabNavigator({
  Home: {
    screen: HomeStack,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name='building' color={tintColor} size={30} />
    },
  },
  Threats: {
    screen: ThreatsStack,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name='envelope' color={tintColor} size={30} />
    }
  },
  Email: {
    screen: EmailStack,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name='paper-plane' color={tintColor} size={30} />
    }
  },
  Feed: {
    screen: FeedStack,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name='list' color={tintColor} size={30} />
    }
  },
  Profile: {
    screen: ProfileStack,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name='user' color={tintColor} size={30} />
    }
  }
}, {
  tabBarOptions: {
    showLabel: false,
    activeTintColor: '#fb4968',
    inactiveTintColor: '#4d5471',
    style: {
      backgroundColor: '#2a3052'
    }
  }
});

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }


  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {

    let token = await AsyncStorage.getItem('token');
    let email = await AsyncStorage.getItem('email');
    let verified = await AsyncStorage.getItem('verified');

    console.log(`Local Storage: token: ${token}, email: ${email}, verified: ${verified}`)

    this.props.navigation.navigate(
      token && email ?
        verified == 1 || verified === 'true' ?
          'Dashboard' : 'Verification'
        : 'Authentication'
    );
  };

  render() {
    return (
      <View style={[style.app, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
}

const AppContainer = createAppContainer(createSwitchNavigator({
  Loading,
  Authentication: AuthStack,
  VerificationStack,
  Dashboard: DashStack,
  Error
}));


class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      notification: {}
    }
  }

  async verifyEmail(url) {
    console.log("URL", url)
    let obj = Linking.parse(url)
    let email = obj.queryParams.registeredProfileEmail
    let { verified } = obj.queryParams

    // // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();
    console.log("VERIFY TOKEN", token)

    if (verified === 'true') {
      Alert.alert(
        'Email successfully verified!',
        email,
        [{ text: 'OK' }],
        { cancelable: false },
      )

      AsyncStorage.setItem('verified', verified)
      this.navigator && this.navigator.dispatch(
        NavigationActions.navigate({ routeName: 'Dashboard' })
      );
    }
    else if (verified === 'false') {
      Alert.alert(
        'Verification link expired',
        email,
        [{ text: 'OK' }],
        { cancelable: false },
      )
    }
    else if (verified === 'null') {
      Alert.alert(
        'There was an error verifying your email',
        email,
        [{ text: 'OK' }],
        { cancelable: false },
      )
    }
  }

  verifyPassword(url) {
    console.log("URL IS", url)
    let obj = Linking.parse(url)
    let { token, verified } = obj.queryParams

    console.log("QUERY TOKEN", token)
    if (verified === 'false') {
      Alert.alert(
        'Reset password link expired',
        'Please try again',
        [{ text: 'OK' }],
        { cancelable: false },
      )
    }
    else if (verified === 'null') {
      Alert.alert(
        'There was an error resetting your password',
        'Please try again later',
        [{ text: 'OK' }],
        { cancelable: false },
      )
    } else {
      let userProfileId = obj.queryParams.userProfileId

      this.navigator && this.navigator.dispatch(
        NavigationActions.navigate({ routeName: 'ResetPassword', params: { userProfileId, token } })
      );
    }
  }



  async componentDidMount() {

    // Initializes Sentry for error monitoring
    Sentry.init({
      dsn: 'https://2a564b5ea3324b4a8088dd0750acb197@sentry.io/1750970',
      enableInExpoDevelopment: false,
      debug: true
    });

    // AsyncStorage.clear()

    // Handle email verification if app is open
    Linking.addEventListener('url', ({ url }) => {
      console.log("Event listener fired:", url)
      if (url.includes('verify/email')) this.verifyEmail(url)
      else if (url.includes('verify/password')) this.verifyPassword(url)
    })

    // Handle email verification if app is closed
    Linking.getInitialURL().then((url) => {
      console.log("Initial Url: ", url)
      if (url.includes('verify/email')) this.verifyEmail(url)
      else if (url.includes('verify/password')) this.verifyPassword(url)
    })



    // Setting default styles for all Text components.
    const customTextProps = {
      style: {
        color: 'white'
      }
    };
    setCustomText(customTextProps);
    this.setState({ loaded: true });

    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // Alert.alert(
    //   `Notification status`,
    //   finalStatus,
    //   [{ text: 'OK' }],
    //   { cancelable: false },
    // )

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    console.log("STATUS", finalStatus)

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }



    let token = await Notifications.getExpoPushTokenAsync();
    console.log("This Device ID is:", token)
    // Alert.alert(
    //   `This Device ID is:`,
    //   token,
    //   [{ text: 'OK' }],
    //   { cancelable: false },
    // )

    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  _handleNotification = async (notification) => {
    if (notification) {
      console.log("NOTIFICATION ARRIVED:", notification)

      // Alert.alert(
      //   `Notification Arrived!`,
      //   notification.data.message,
      //   [{ text: 'OK' }],
      //   { cancelable: false },
      // )

      let userProfileId = await AsyncStorage.getItem('userProfileId')

      if (userProfileId) {
        axios.get(`${constants.BASE_URL}/notifications/count?userProfileId=${userProfileId}`, { headers: { 'Authorization': await AsyncStorage.getItem('token') } })
          .then(resp => {
            console.log('Notification counter', resp.data)
            AsyncStorage.setItem('notificationCounter', JSON.stringify(resp.data.notificationHistoryList))
          })
          .catch(err => console.log(err))
      }

      // Handles notifications in foreground
      this.popup.show({
        onPress: function () { console.log('Pressed') },
        appIconSource: require('./assets/lacl-small.png'),
        appTitle: 'LA Cyber Lab',
        timeText: 'Now',
        body: notification.data.message,
        slideOutTime: 1500
      });
    }
  };


  render() {

    return (
      <Provider
        store={store}>

        <View style={style.app}>
          <StatusBar barStyle="light-content" />
          <AppContainer ref={nav => { this.navigator = nav; }} />
          <NotificationPopup
            ref={ref => this.popup = ref}
            renderPopupContent={renderCustomPopup}
          />
        </View>
      </Provider>

    )
  }
}


const renderCustomPopup = ({ appIconSource, appTitle, timeText, title, body }) => (
  <View style={{ backgroundColor: '#d3d3d3', padding: 15, borderRadius: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
      <Image source={appIconSource} style={{ width: 30, height: 30, marginRight: 10 }} />
      <Text style={{ color: '#000', fontSize: 16 }}>LA Cyber Lab</Text>
    </View>
    {/* <Text style={{ color: '#000' }}>{title}</Text> */}
    <Text style={{ color: '#000' }}>{body}</Text>
  </View>
);

registerRootComponent(App);