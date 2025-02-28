import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const FollowList = ({ type }) => { // type: "followers" or "following"
  const { username } = useParams();
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${type}/${username}`);
        setList(type === 'followers' ? response.data.followers : response.data.following);
      } catch (err) {
        setError(err.response?.data?.message || `Failed to fetch ${type}`);
      }
    };
    fetchList();
  }, [username, type]);

  const handleFollowToggle = async (targetUsername, isFollowing) => {
    try {
      const url = isFollowing
        ? `http://localhost:5000/api/users/unfollow/${targetUsername}`
        : `http://localhost:5000/api/users/follow/${targetUsername}`;
      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setList((prev) =>
        isFollowing
          ? prev.filter((user) => user.authId.username !== targetUsername)
          : [...prev, { authId: { username: targetUsername } }]
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (list.length === 0) return <div className="text-center mt-10 text-gray-600">No {type} found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">{username}'s {type.charAt(0).toUpperCase() + type.slice(1)}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {list.map((user) => (
            <Card key={user._id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{user.authId.username}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex justify-between items-center">
                <p className="text-md text-gray-700">{user.authId.name}</p>
                {token && (
                  <Button
                    variant={type === 'following' ? 'destructive' : 'outline'}
                    onClick={() => handleFollowToggle(user.authId.username, type === 'following')}
                  >
                    {type === 'following' ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowList;