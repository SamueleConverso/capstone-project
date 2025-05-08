import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPostById } from "../redux/actions/post";
import { getUserById, getOtherUserById } from "../redux/actions/user";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import EnhancedPostCard from "./EnhancedPostCard";

function PostDetailsPage() {
  const dispatch = useDispatch();

  const { postId } = useParams();

  const post = useSelector((state) => state.post.post);
  const currentUser = useSelector((state) => state.profile.user);
  const otherUser = useSelector((state) => state.profile.userToView);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePostId, setActivePostId] = useState(null);

  const handlePostInteraction = (postId) => {
    setActivePostId(postId);
  };

  useEffect(() => {
    setCurrentUserId(jwtDecode(localStorage.getItem("jwtToken")).id);
  }, []);

  useEffect(() => {
    if (postId) {
      dispatch(getPostById(postId));
    }
  }, [postId]);

  useEffect(() => {
    if (currentUserId) {
      dispatch(getUserById(currentUserId));
    }
  }, [currentUserId]);

  useEffect(() => {
    if (post) {
      setOtherUserId(post.applicationUserId);
    }
  }, [post]);

  useEffect(() => {
    if (otherUserId) {
      dispatch(getOtherUserById(otherUserId));
    }
  }, [otherUserId]);

  useEffect(() => {
    if (post && currentUser && otherUser) {
      setIsLoading(false);
    }
  }, [post, currentUser, otherUser]);

  return (
    <>
      {isLoading ? (
        <div>Caricamento post in corso...</div>
      ) : (
        <div>
          <EnhancedPostCard
            post={post}
            user={currentUser}
            isProfileView={true}
            authorUser={otherUser}
            onInteraction={handlePostInteraction}
            isActive={post.postId === activePostId}
          />
        </div>
      )}
    </>
  );
}

export default PostDetailsPage;
