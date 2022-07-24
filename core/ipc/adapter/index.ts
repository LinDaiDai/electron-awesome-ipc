export function GetTarget () {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    console.log('GetTarget', target, name, descriptor);
    const originFunc = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const result = originFunc.apply(target, args);
      return result;
    };
  }
};
