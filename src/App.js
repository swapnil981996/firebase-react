import React from 'react';
import logo from './logo.svg';
import './App.css';
import clsx from 'clsx';
import firebase from 'firebase'
import {firebaseConfig} from './config'
import {Table,TableBody,TableRow,TableCell,TableHead} from '@material-ui/core'

class App extends React.Component{
  constructor(props)
  {
    super(props)
    this.users=[]
    this.accounts=''
    this.state={
      userAppData:[],
      ratings:[]
    }
    this.userAppData=[]
    this.rating=[1,2,3,4,5]
  }
  componentDidMount()
  {
      firebase.initializeApp(firebaseConfig);
      this.getUserList()
      this.getAccountsList()
  }

  // get user list from firebase
  getUserList = () => {
    let user=firebase.database().ref('users')
      user.on('value', (snapshot) => {
        let state = snapshot.val();
        for(let userdata in state)
        {
            this.users.push(state[userdata])
        }
      });
  }

  //get accountlist from firebase and create object to render user list
  getAccountsList = () =>{
    this.accounts=firebase.database().ref('accounts')
      this.accounts.on('value', (snapshot) => {
        const state = snapshot.val();
        for(let accountdata in state)
        {
           for(let i=0;i<this.users.length;i++)
           {
             if(this.users[i].account==accountdata)
             {
                let obj={title:state[accountdata].apps,account:this.users[i]['account'],user:this.users[i]['name']}
                this.userAppData.push(obj)
                this.setState({
                  userAppData:this.userAppData
                })
                this.setState({
                  ratings:state[accountdata].apps
                })
             } 
           }
        }
      });
  }

  //update realtime database in friebase
  ratingFeedback = (account,keys,ratings) =>{
    let app=firebase.database().ref('accounts').child(account).child('apps').child(keys)
    let title=''
    app.on('value', (snapshot) => {
      title=snapshot.val().title
    })
    app.update({
      title: title,
      rating: ratings
    });
    this.userAppData=[]
    this.getAccountsList()
  }

  render(){
    return(
      <div>
        <Table>
        <TableHead>
          <TableRow>
            <TableCell className='table_header'>USER</TableCell>
            <TableCell className='table_header'>ACCOUNT ID</TableCell>
            <TableCell className='table_header'>APP TITLE</TableCell>
            <TableCell className='table_header'>RATINGS</TableCell>
          </TableRow>
        </TableHead>
          <TableBody>
            {this.state.userAppData.map((data)=>{
              return (<TableRow>
                  <TableCell component="th" scope="row">
                  {data.user}
                </TableCell>
                <TableCell  component="th" scope="row">
                  {data.account}
                </TableCell>
                <TableCell component="th" scope="row">
                  {Object.keys(data.title).map((keys)=>{
                    return data.title[keys]['title']
                  })}
                </TableCell>
                <TableCell component="th" scope="row">
                  {console.log()}
                {Object.keys(data.title).map((keys)=>{
                  return this.rating.map((val)=>{
                  return(
                    <span style={{cursor:'pointer'}} className={clsx("fa fa-star",{"checked":val<=data.title[keys]['rating']})} onClick={()=>{this.ratingFeedback(data.account,keys,val)}}></span>
                  )
                })
              })}
                </TableCell>
              </TableRow>)
            })}
            </TableBody>
         </Table> 
      </div>
    )
  }
}

export default App;
