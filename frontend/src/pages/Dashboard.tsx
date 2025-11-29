import React, { useEffect, useState } from "react";
import Header from '../components/Header';
import { Upload, Settings, Shield, Download, Database, FileText, Activity } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from "axios";


const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });
      setUserName(res.data.name);
    } catch (err) {
      console.error("Failed to load user", err);
      setUserName("User");
    }
  };

  fetchUser();
}, []);


  const handleCardClick = (title: string) => {
    if (title === "Upload Dataset") navigate("/upload");
    if (title === "View Datasets") navigate("/datasets");
    if (title === "Create Policy") navigate("/policies");
    if (title === "Run Anonymization Job") navigate("/run-job");
    if (title === "View Policies") navigate("/policies");
    if (title === "Audit Logs") navigate("/audit-logs");
  };

  const quickActions = [
    {
      icon: Upload,
      title: 'Upload Dataset',
      description: 'Upload CSV files to begin anonymization.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Settings,
      title: 'Create Policy',
      description: 'Define masking, k-anonymity, and l-diversity rules.',
      color: 'from-cyan-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Run Anonymization Job',
      description: 'Apply a policy to a dataset and generate a masked output.',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: Database,
      title: 'View Datasets',
      description: 'Browse and manage all uploaded datasets.',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: FileText,
      title: 'View Policies',
      description: 'See your saved anonymization rules.',
      color: 'from-teal-500 to-blue-500'
    },
    {
      icon: Activity,
      title: 'Audit Logs',
      description: 'Review user activity and job history.',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  const recentDatasets = [
    { name: 'Customer Data Q1', uploadedDate: '2023-10-01', size: '2.5 MB', status: 'Processed' },
    { name: 'Sales Records 2023', uploadedDate: '2023-09-28', size: '1.8 MB', status: 'Pending' },
    { name: 'Employee Info', uploadedDate: '2023-09-25', size: '3.2 MB', status: 'Processed' }
  ];

  const recentJobs = [
    { jobId: 'JOB-001', dataset: 'Customer Data Q1', policy: 'k-Anonymity', status: 'Completed', date: '2023-10-02' },
    { jobId: 'JOB-002', dataset: 'Sales Records 2023', policy: 'Differential Privacy', status: 'Running', date: '2023-10-01' },
    { jobId: 'JOB-003', dataset: 'Employee Info', policy: 'l-Diversity', status: 'Failed', date: '2023-09-30' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {userName}
          </h1>
          <p className="text-xl text-slate-600">
            Manage datasets, policies, and anonymization jobs all in one place.
          </p>
        </section>

        {/* Quick Actions Grid */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 cursor-pointer"
                onClick={() => handleCardClick(action.title)}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{action.title}</h3>
                <p className="text-slate-600 text-sm">{action.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Datasets */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-slate-900">Recent Datasets</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dataset Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Uploaded Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {recentDatasets.map((dataset, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{dataset.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{dataset.uploadedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{dataset.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            dataset.status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {dataset.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-slate-900">Recent Jobs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Job ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dataset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Policy Applied</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {recentJobs.map((job, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{job.jobId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{job.dataset}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{job.policy}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'Running' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{job.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
