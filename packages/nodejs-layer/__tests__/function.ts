export const handler = () => {
  const obj = { a: 1, b: { c: 2, d: 3, e: { f: 4 } } }
  console.log('from test', obj)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world'
    })
  }
}
