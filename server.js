const express = require('express')
const { callQueue } = require('./messageQueue')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const router = express.Router()
const port =  3200

app.use(bodyParser.json())
app.use(cors({ origin: true }))




app.use('/api/v1', router.post('/callQueue', callQueue))

app.listen(port, () => {
  console.log(`Start server at port ${port}.......`)
})


