//Error is js inbuilt class of js so all functionality of Error is available to constructor
class CustomErrorHandler extends Error {
  constructor(status, msg) {
    super(); //Error class contructor or parent class contructor
    this.status = status;
    this.message = msg;
  }
  //static mehod : we can call this method without creating class object

  //this is our custom error for email already exist
  //In your code example, you're using the new keyword when calling the constructor of your CustomErrorHandler class inside the static methods.

  static alreadyExist(message) {
    //now here we make CustomErrorHandler Object and return it
    return new CustomErrorHandler(409, message);
  }

  static wrongCredentials(message = "username or password is wrong") {
    return new CustomErrorHandler(401, message); //unathorised status code
  }

  static unAuthorized(message = "unAuthorized access") {
    return new CustomErrorHandler(401, message); //unathorised status code
  }

  static notFound(message = "404 Not Found") {
    return new CustomErrorHandler(404, message); //unathorised status code
  }

  static serverError(message = "Internal Server Error") {
    return new CustomErrorHandler(500, message); //unathorised status code
  }
}
export default CustomErrorHandler;
