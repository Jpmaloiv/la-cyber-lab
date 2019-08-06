import React from 'react';
import { AsyncStorage, StatusBar, View } from 'react-native'
import { createStackNavigator, createAppContainer, createSwitchNavigator, createBottomTabNavigator } from 'react-navigation';
import { setCustomText } from 'react-native-global-props'
import Icon from 'react-native-vector-icons/FontAwesome';
import style from './style'

import Welcome from './src/components/Authentication/Welcome'
import CreateAccount from './src/components/Authentication/CreateAccount'
import CreatePassword from './src/components/Authentication/CreatePassword'
import IndustrySelect from './src/components/Authentication/IndustrySelect'
import LocationSelect from './src/components/Authentication/LocationSelect'
import SignIn from './src/components/Authentication/SignIn'

import Home from './src/components/Pages/Home'
import Threats from './src/components/Pages/Threats'
import Email from './src/components/Pages/Email'
import Feed from './src/components/Pages/Feed'
import Profile from './src/components/Pages/Profile'


// Base URL endpoint
global.BASE_URL = 'http://10.0.1.200:3030'

// Navigation
const AuthStack = createStackNavigator({
  Welcome,
  CreateAccount,
  CreatePassword,
  IndustrySelect,
  LocationSelect,
  SignIn
}, {
    defaultNavigationOptions: {
      headerStyle: {
        borderBottomWidth: 0
      }
    },
    // ? Not sure why this needs to be set, not receiving App style
    cardStyle: {
      backgroundColor: '#242947'
    }
  })

const DashStack = createBottomTabNavigator({
  Home: {
    screen: Home,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name='building' color={tintColor} size={30} />
    },
  },
  Threats: {
    screen: Threats,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name='envelope' color={tintColor} size={30} />
    }
  },
  Email: {
    screen: Email,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name='paper-plane' color={tintColor} size={30} />
    }
  },
  Feed: {
    screen: Feed,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name='list' color={tintColor} size={30} />
    },
  },
  Profile: {
    screen: Profile,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name='user' color={tintColor} size={30} />
    },
  },
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
    const userToken = await AsyncStorage.getItem('token');
    this.props.navigation.navigate(userToken ? 'Dashboard' : 'Authentication');
    // this.props.navigation.navigate(userToken ? 'Dashboard' : 'Dashboard');

  };

  render() {
    return (
      <View />
    );
  }
}

const AppContainer = createAppContainer(createSwitchNavigator({
  Loading: Loading,
  Authentication: AuthStack,
  Dashboard: DashStack
}));


export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
    }
  }

  componentDidMount() {
    // AsyncStorage.clear()

    // Setting default styles for all Text components.
    const customTextProps = {
      style: {
        color: 'white'
      }
    };
    setCustomText(customTextProps);
    this.setState({ loaded: true });
  }


  render() {
    if (this.state.loaded) {
      return (
        <View style={style.app}>
          <StatusBar barStyle="light-content" style={{ marginBottom: 24 }} />
          <AppContainer />
        </View>
      )
    }
    else return null
  }
}
