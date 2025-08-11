import mongoose from 'mongoose';
import userSchema from '../Schemas/userSchema.js';

const User = mongoose.model('User', userSchema);
export default User;



// import mongoose from 'mongoose';
// import userSchema from '../Schemas/userSchema.js';

// const User = mongoose.model('User', userSchema);

// export default User;
