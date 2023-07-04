import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
  auth: null,
  setAuth: () => {},
  user: null,
});

export const useAuth = () => useContext(AuthContext);

const UseFetch = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const isAuth = async () => {
        try{
            const res=fetch("/profile",{
                method:"GET",
                headers:{
                    Accept:"application/json",
                    "Content-Type":"application/json"
                },
                credentials:"include"
            });
            const data=await res.json();
            if(res.status!==200){
                setUser(null);
            }
            else if(res.status===200){
                setUser(data);
            }
        }catch(err){
            // navigate("/signin");
            console.log(err);
        }
    };

    isAuth();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default UseFetch;