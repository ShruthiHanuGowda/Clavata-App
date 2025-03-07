export default {
    email: new RegExp(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ),
    name: /^[a-zA-Z]+$/,
    phoneNo: /^[0-9-+()]*$/,
    password: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{12,}$/,
    //password:/^(?=.*?[a-z]).{8,}$/,
    numberAndFloatingNumber: /^\d*\.?\d*$/,
    isEmpty(val) {
      return val === "" || val === undefined || val == null || val.length <= 0
        ? true
        : false;
    },
    only2Decimal: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
    
    Loginregex: /^([_a-zA-Z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,5}))|(\d+$)$/,
    cyrillicRegex : /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  };
  