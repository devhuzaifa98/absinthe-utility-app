"use client";

import { useEffect, useState } from "react";
import {
  PointsClient,
  PointsResponse,
  PointsData,
} from "@devhuzaiffa/absinthe-sdk";

interface FormData {
  eventName: string;
  pointsData: {
    points: number;
    address: string;
  };
}

const PointsList = () => {
  const [pointsList, setPointsList] = useState<PointsResponse[]>([]);
  const [query, setQuery] = useState<{ eventName: string; address: string }>({
    eventName: "",
    address: "",
  });
  const [formData, setFormData] = useState<FormData>({
    eventName: "",
    pointsData: { points: 0, address: "" },
  });
  const [error, setError] = useState<string>("");

  const pointsClient = new PointsClient({
    apiKey:
      process.env.NEXT_PUBLIC_API_KEY,
    campaignId: process.env.NEXT_PUBLIC_CAMPAIGN_ID,
  });

  const fetchPointsList = async () => {
    try {
      let points: PointsResponse[] = [];

      if (query.eventName && query.address) {
        points = await pointsClient.getPointsByEvent(
          query.address,
          query.eventName
        );
      } else if (query.address) {
        points = await pointsClient.getPoints(query.address);
      } else {
        points = await pointsClient.getPoints();
      }

      setPointsList(points);
    } catch (error) {
      console.error("Error fetching points:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await pointsClient.distribute(formData.eventName, formData.pointsData);
      setFormData({
        eventName: "",
        pointsData: { points: 0, address: "" },
      });
      setQuery({ eventName: "", address: "" });
      setError("");
      fetchPointsList();
    } catch (error) {
      setError(
        "Error distributing points. Please check the fields and try again."
      );
      console.error("Error distributing points:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchPointsList();
  };

  useEffect(() => {
    fetchPointsList();
  }, []);

  return (
    <div className="mx-auto w-7/12 flex flex-col items-center mt-12">
      <div className="w-full flex min-h-full flex-1 flex-col justify-center p-6 lg:px-8 bg-gray-900 rounded-md mb-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    id="eventName"
                    name="eventName"
                    type="text"
                    autoComplete="eventName"
                    placeholder="Event Name"
                    required
                    className="block w-full rounded border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={formData.eventName}
                    onChange={(e) =>
                      setFormData({ ...formData, eventName: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <input
                    id="points"
                    name="points"
                    type="number"
                    autoComplete="points"
                    placeholder="Points"
                    required
                    className="block w-full rounded border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={formData.pointsData.points ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pointsData: {
                          ...formData.pointsData,
                          points: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="address"
                  placeholder="0x123....32"
                  required
                  className="block w-full rounded border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={formData.pointsData.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pointsData: {
                        ...formData.pointsData,
                        address: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Distribute Points
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="w-full py-10 rounded-lg border border-gray-900">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-white">
                Points Lists
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                List of all points distributed to users
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-auto">
              <form
                className="mt-5 sm:flex sm:items-center gap-x-2"
                onSubmit={handleSearch}
              >
                <div className="w-full sm:max-w-xs">
                  <label htmlFor="eventName" className="sr-only">
                    Event Name
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    id="eventName"
                    className="block w-full rounded border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Event Name"
                    value={query.eventName}
                    onChange={(e) =>
                      setQuery({ ...query, eventName: e.target.value })
                    }
                  />
                </div>
                <div className="w-full sm:max-w-xs">
                  <label htmlFor="address" className="sr-only">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    className="block w-full rounded border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="0x1234.....32"
                    value={query.address}
                    onChange={(e) =>
                      setQuery({ ...query, address: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 inline-flex w-full items-center justify-center rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:mt-0 sm:w-auto"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                      >
                        Event Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      >
                        Points
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      >
                        Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {pointsList.map((point, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                          {point.eventName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                          {point.pointsData.points}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                          {point.pointsData.address}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsList;
