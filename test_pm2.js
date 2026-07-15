module.exports = {
  apps: [{
    name: 'test-backend',
    script: 'python3',
    args: '-c "import time; print(\\"hello\\"); time.sleep(10)"',
    instances: 1,
  }]
}
