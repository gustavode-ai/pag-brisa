import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login";
import MainPage from "./components/QueryForm";
import Nav from "./components/navbar";
import AdminDashboard from "./components/Admin";
import SmsAnalise from "./components/SmsAnalise";
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/privateroute";
import Desbloqueio from "./components/desbloqueioadmin";
import NavAdmin from "./components/navAdmin";
import Queryformadmin from "./components/queryformadmin";
import SmsAnaliseadmin from "./components/SmsAnaliseadmin";
import Background from "./components/background";
import Acompanhamento from "./components/Acompanhamenton2";
import Tacs from "./components/Tacs";
import Provisionamento from "./components/Provisionamento";
const App = () => {
  return (
    <Router>
      <Routes>
        
        <Route
          path="/"
          element={
            <>
              <Background />
              <Login />
            </>
          }
        />

        {/* Painel de administração */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute
              element={
                <>
                  <NavAdmin />
                  <AdminDashboard />
                </>
              }
            />
          }
        />

        {/* Página de consulta de dados */}
        <Route
          path="/QueryForm"
          element={
            <PrivateRoute
              element={
                <>
                  <Nav />
                  <MainPage />
                </>
              }
            />
          }
        />

        {/* Página de análise de SMS */}
        <Route
          path="/sms-analise"
          element={
            <PrivateRoute
              element={
                <>
                  <Nav />
                  <SmsAnalise />
                </>
              }
            />
          }
        />
        <Route
          path="/AcompanhamentoN2"
          element={
            <PrivateRoute
              element={
                <>
                  <Nav />
                  <Acompanhamento />
                </>
              }
            />
          }
        />
        
        <Route
          path="/AcompanhamentoN2admin"
          element={
            <PrivateRoute
              element={
                <>
                  <NavAdmin />
                  <Acompanhamento />
                </>
              }
            />
          }
        />
        <Route
          path="/Provisionamento"
          element={
            <PrivateRoute
              element={
                <>
                  <Nav />
                  <Provisionamento />
                </>
              }
            />
          }
        />
        <Route
          path="/Tacs"
          element={
            <PrivateRoute
              element={
                <>
                  <Nav />
                  <Tacs />
                </>
              }
            />
          }
        />
        <Route
          path="/Tacsadmin"
          element={
            <PrivateRoute
              element={
                <>
                  <NavAdmin />
                  <Tacs />
                </>
              }
            />
          }
        />

        {/* Desbloqueio Admin */}
        <Route
          path="/desbloqueioadmin"
          element={
            <PrivateRoute
              element={
                <>
                  <NavAdmin />
                  <Desbloqueio />
                </>
              }
            />
          }
        />

        {/* Query Form Admin */}
        <Route
          path="/queryformadmin"
          element={
            <PrivateRoute
              element={
                <>
                  <NavAdmin />
                  <Queryformadmin />
                </>
              }
            />
          }
        />

        {/* SMS Análise Admin */}
        <Route
          path="/SmsAnaliseadmin"
          element={
            <PrivateRoute
              element={
                <>
                  <NavAdmin />
                  <SmsAnaliseadmin />
                </>
              }
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
