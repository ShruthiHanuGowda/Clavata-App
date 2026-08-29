const Razorpay = {
    open: async (_options: any): Promise<any> => {
        throw new Error(
            'Razorpay native SDK is not available on web.'
        );
    },
};

export default Razorpay;