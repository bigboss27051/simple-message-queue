const RedisSMQ = require("rsmq");
const rsmqWorker = require("rsmq-worker")
const { logQueue } = require("./common")

const rsmq = new RedisSMQ({ host: "127.0.0.1", port: 6379, ns: "rsmq" });

rsmq.createQueueAsync({ qname: "logQueue" }, function (err, resp) {
  try {
    if (response === 1) {
      console.log("Queue created", response);
    }
  } catch (err) {

    if (err.name == 'queueExists')
      console.log(" DQueue Exists")

    else ("redis error")
  }
});

rsmq.listQueuesAsync(function (err, queues) {
  if (err) {
    console.error(err)
    return
  }

  console.log("Active queues: " + queues.join(","))
});

rsmq.getQueueAttributesAsync({ qname: "logQueue" }, function (err, resp) {
  if (err) {
    console.error(err);
    return;
  }

  console.log("==============================================");
  console.log("=================Queue Stats==================");
  console.log("==============================================");
  console.log("visibility timeout: ", resp.vt);
  console.log("delay for new messages: ", resp.delay);
  console.log("max size in bytes: ", resp.maxsize);
  console.log("total received messages: ", resp.totalrecv);
  console.log("total sent messages: ", resp.totalsent);
  console.log("created: ", resp.created);
  console.log("last modified: ", resp.modified);
  console.log("current n of messages: ", resp.msgs);
  console.log("hidden messages: ", resp.hiddenmsgs);
});
const worker = new rsmqWorker("logQueue", {
  timeout: 50000, 
  maxReceiveCount: 999,
  host: "127.0.0.1",
  port: 6379,
  ns: "rsmq"
});


worker.on("message", async (msg, next, id) => {
  console.log({ msg })
  const number = msg
  await logQueue(number)
  next()
});

// optional error listeners
worker.on('error', function (err, msg) {
  console.log("ERROR", err, msg.id);
});
worker.on('exceeded', function (msg) {
  console.log("EXCEEDED", msg.id);
});
worker.on('timeout', function (msg) {
  console.log("TIMEOUT", msg.id, msg.rc);
});
worker.start();

const callQueue = async (req, res) => {

  try {
    const { number = 0 } = req.body
    response = await rsmq.sendMessageAsync({
      qname: "logQueue",
      message: number
    })
    console.log({ response })

    if (response) {
      console.log("Message sent. ID:", response);
      res.send(`Message sent. ID: ${response}`)
    }
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }


}

module.exports = {
  callQueue
}