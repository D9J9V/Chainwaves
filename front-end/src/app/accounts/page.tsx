import React, { useEffect, useState } from "react";
import PhylloSDK from "../users/phylloServiceAPIs";
import { getAccounts } from "../../phylloSDKService/phylloServiceAPIs";
import Navbar from "../Navbar/Navbar";
import "./AccountSummary.css";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [attributes, setAttributes] = useState({});
  const phylloSDK = new PhylloSDK();

  const handleAddAccount = async () => {
    await phylloSDK.openPhylloSDK();
  };

  const flattenObj = (ob) => {
    let result = {};
    for (const i in ob) {
      if (typeof ob[i] === "object" && !Array.isArray(ob[i])) {
        const temp = flattenObj(ob[i]);
        for (const j in temp) {
          result[i + "." + j] = temp[j];
        }
      } else {
        result[i] = ob[i];
      }
    }
    return result;
  };

  useEffect(() => {
    (async () => {
      const response = await getAccounts(localStorage.getItem("PHYLLO_USER_ID"));
      const arr = response.data.data;
      if (arr.length > 0) {
        const updatedArray = arr.map((obj) => flattenObj(obj));
        setAccounts(updatedArray);
        setAttributes(updatedArray[0]);
      }
    })();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="table-responsive" style={{ display: "block", margin: "auto", width: "95%" }}>
        <table className="table table-striped table-bordered" style={{ margin: "20px" }}>
          <thead>
            <tr>
              <th>Attribute</th>
              {accounts.map((obj, idx) => (
                <th scope="col" key={idx}>
                  Account-{idx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {Object.entries(attributes).map((obj, idx) => (
                  <tr key={idx}>{obj[0]}</tr>
                ))}
              </td>
              {accounts.map((obj, idx) => (
                <Account accountObj={obj} key={idx} attributes={attributes} />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <button className="account-connect-button" onClick={handleAddAccount}>
        Add Another Account
      </button>
    </div>
  );
};

function Account({ accountObj, attributes }) {
  return (
    <td>
      {Object.entries(attributes).map((obj, idx) => {
        const key = obj[0];
        if (key === "profile_pic_url" || key === "work_platform.logo_url") {
          return (
            <tr key={idx}>
              <img src={accountObj[key]} alt="" />
            </tr>
          );
        } else if (key === "status") {
          return (
            <tr key={idx}>
              <div className="status">
                {accountObj[key]}
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    background: accountObj[key] === "CONNECTED" ? "green" : accountObj[key] === "NOT_CONNECTED" ? "red" : "orange",
                    borderRadius: "50%",
                    marginLeft: "10px",
                  }}
                ></div>
              </div>
            </tr>
          );
        } else if (accountObj[key] === undefined) {
          return <tr key={idx}>-</tr>;
        }
        return <tr key={idx}>{accountObj[key]}</tr>;
      })}
    </td>
  );
}

export default Accounts;

