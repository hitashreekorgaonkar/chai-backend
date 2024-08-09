// asyncHandler is a higher-order function for below both examples

// NOTE: 1] This is Promise
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// NOTE: 2] This is try-catch

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// NOTE: explaination ep.8 27:20
// const asyncHandler = () => {};
// const asyncHandler = (fn) => {() => {}} is same (fn) => () => {}; w/o {}
