import { RouterProvider } from 'react-router-dom';
import Providers from './Providers';
import router from './Router';

export default function App() {
          return (
                    <Providers>
                              <RouterProvider router={router} />
                    </Providers>
          );
}
