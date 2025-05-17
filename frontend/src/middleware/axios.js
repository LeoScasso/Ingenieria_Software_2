import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Points to your backend API base
  // You can add other default settings here, like headers or timeout
});

// You can also intercept requests or responses globally if needed
// instance.interceptors.request.use(config => {
//   // Do something before request is sent, e.g., add auth token
//   // const token = localStorage.getItem('token');
//   // if (token) {
//   //   config.headers.Authorization = `Bearer ${token}`;
//   // }
//   return config;
// }, error => {
//   return Promise.reject(error);
// });

// instance.interceptors.response.use(response => {
//   // Any status code that lie within the range of 2xx cause this function to trigger
//   return response;
// }, error => {
//   // Any status codes that falls outside the range of 2xx cause this function to trigger
//   // console.error('Axios response error:', error.response || error.message);
//   // You might want to handle global errors here, e.g., redirect on 401
//   return Promise.reject(error);
// });

export default instance;
