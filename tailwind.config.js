const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  content: [
    './index.html',
    './src/**/*.{html,js}',
    './JS/**/*.js',
    './CSS/**/*.css'
  ],
  theme: {
    extend: {
      colors: {
        brandOne: '#ffb545',
        brandTwo: '#00c46a',
        darkOne: '#2d3439',
        darkTwo: '#42484d',
        lightOne: '#aaa',
        lightTwo: '#ececec',
        lightThree: 'rgb(214,222,224)' 
      },
      fontFamily: {
        'manrope': ['Manrope',...defaultTheme.fontFamily.sans], 
      }
      
    },
  },
  plugins: [],
}
