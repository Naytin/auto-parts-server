const cron = require('node-cron');
const {main} = require('../uniquetrade')

// run every midnight
cron.schedule('0 1 * * *', () => {
  try {
    console.log('Запускаем скрипт обновления прайс листа');
    main()
  } catch (error) {
    console.log(error)
  }
});
