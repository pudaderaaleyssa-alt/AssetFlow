import { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-off-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-asset shadow-sm border border-mint">
        <h2 className="text-2xl font-bold text-dark-gray mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Join AssetFlow'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-sage"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-sage"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-sage text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-sm text-gray-500 hover:text-sage"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default Auth;