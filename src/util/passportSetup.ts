const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

passport.use(
    new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: '/api/auth/google/redirectPetNanny',
    scope: [ 'profile' ]
  }, (accessToken: any,refreshToken: any,profile: any,done: any)=> {
    //passport callback
    console.log('passport callback success');
    console.log(profile);
  }));