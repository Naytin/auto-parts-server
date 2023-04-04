const cron = require('node-cron');
const {main} = require('../uniquetrade')

//run every hour
cron.schedule('0 * * * *', () => {
  try {
    console.log('Запускаем скрипт обновления прайс листа');
    main()
  } catch (error) {
    console.log(error)
  }
});

// run every midnight
// cron.schedule('0 0 * * *', () => {
  // try {
  //   console.log('Запускаем скрипт обновления прайс листа');
  //   main()
  // } catch (error) {
  //   console.log(error)
  // }
// });