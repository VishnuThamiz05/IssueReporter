package com.example.Springgaejdohello.model;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Parent;

import java.util.Date;

@Entity
public class CommentModel {

    @Id
    String id;

    @Parent @Index Key<IssueModel> issueID;
    @Index Key parentID;
    String message;
    String author;

    //without parentID
    public CommentModel(String id, String issueID, String message, String author) {
        this.id = id;
        this.issueID = Key.valueOf(issueID);
        this.message = message;
        this.author = author;
    }

    //with parentID
    public CommentModel(String id, String issueID, String parentID, String message,String author) {
        this.id = id;
        this.issueID = Key.valueOf(issueID);
        this.parentID = Key.valueOf(parentID);
        this.message = message;
        this.author = author;
    }

    public CommentModel() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = String.valueOf(new Date().getTime());
    }

    public String getIssueID() {
        return issueID.toWebSafeString();
    }

    public void setIssueID(String issueID) {
        this.issueID = Key.valueOf(issueID);
    }

    public String getParentID() {
        return parentID.toWebSafeString();
    }

    public void setParentID(String parentID) {
        this.parentID = Key.valueOf(parentID);
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }
}