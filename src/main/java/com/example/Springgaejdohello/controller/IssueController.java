package com.example.Springgaejdohello.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.Springgaejdohello.ObjectifyWorker;
import com.example.Springgaejdohello.dao.IssueDAOService;
import com.example.Springgaejdohello.model.IssueModel;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.QueryResultIterator;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskHandle;
import com.google.appengine.api.taskqueue.TaskOptions;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.cmd.Query;

@Controller
@RequestMapping("/")
public class IssueController {

	@RequestMapping("/")
	public String home() {
		return "issues.html";
	}
	
	/*
	@RequestMapping("/testjdo")
	public @ResponseBody String testJDO(@RequestParam("name")String name,
						 @RequestParam("age")String age) {
		
        try {
    			ObjectifyService.ofy().save().entity(new IssueModel(name,age)).now();
        }catch(Exception e) {
        		return e.getMessage();
        }
        
        return "worked!";
	}*/
	
	//create issue
	@RequestMapping(value = "/issue/create", method = RequestMethod.POST, consumes = "application/json")
    public @ResponseBody String setIssue(@RequestBody String body) throws JsonParseException, JsonMappingException, IOException {

        //List<String> tagslist = Arrays.asList(tags);
			
		ObjectMapper mapper = new ObjectMapper();
		
		Map<String,Object> issuePayload = mapper.readValue(body, new TypeReference<Map<String, Object>>() {});
        IssueModel newTicket = generateIssue(issuePayload);
        

        Map<String,Object> response = new HashMap<>();
        //ObjectifyService.ofy().save().entity(newTicket).now();

        
        try {
            ObjectifyWorker.getofy().save().entity(newTicket).now();
            response.put("ok",true);
            response.put("status","entity save success");
            response.put("code",newTicket.getCode());
        }catch(Exception e) {
        		
        }
        
        String jsonResponse = "problem with jackson";
        //mapper.writeValueAsString(response);
		try {
			jsonResponse = mapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

        return jsonResponse;
    }
	
	@RequestMapping(value = "/issue/readall", method = RequestMethod.GET, produces = "application/json")
	public @ResponseBody String readAll(@RequestParam(value = "cursor", defaultValue = "") String cursorStr){
		
		//hard coded
		int limit = 10;
		
		IssueDAOService issuedao = new IssueDAOService();
		QueryResultIterator<IssueModel> resultSet = issuedao.getAllIssues(cursorStr,limit);
		String cursorNext = "";
		boolean continu = false;
		List<IssueModel> issues = new ArrayList<IssueModel>();
		
		while(resultSet.hasNext()) {
			issues.add(resultSet.next());
			continu = true;
		}
		
		if(continu) {
			cursorNext = resultSet.getCursor().toWebSafeString();
//			cursorNext = resultSet.getCursor().toWebSafeString();
//			Queue queue = QueueFactory.getDefaultQueue();
//	        String url = "/issue/readAll?cursor="+cursorNext;
//	        TaskOptions fetchAllIssues = TaskOptions.Builder.withUrl(url);
//	        queue.add(fetchAllIssues);
		}
		
        Map<String,Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("next",cursorNext);
        response.put("issues", issues);
		
        String jsonResponse = "";
        ObjectMapper mapper = new ObjectMapper();
		
		try {
			jsonResponse = mapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return jsonResponse;
	}
	
	@RequestMapping("/issue/readbybatch")
	protected List<IssueModel> readAllService(@RequestParam(value = "cursor", defaultValue = "") String cursorStr) {
		
		Query<IssueModel> query = ObjectifyWorker.getofy().load().type(IssueModel.class).limit(10);
		
		if(!cursorStr.isEmpty()) {
			query = query.startAt(Cursor.fromWebSafeString(cursorStr));
		}
		
		boolean continu = false;
		QueryResultIterator<IssueModel> queryres = query.iterator();
		
		List<IssueModel> resultSet = new ArrayList<IssueModel>();
		while(queryres.hasNext()) {
			resultSet.add(queryres.next());
			continu = true;
		}
		
		if(continu) {
			Cursor cursornext = queryres.getCursor();
	        //Queue queue = QueueFactory.getDefaultQueue();
	        //String url = "/issue/readbybatch?cursor="+cursornext.toWebSafeString();
	        //TaskOptions fetchAllIssues = TaskOptions.Builder.withUrl(url);
	        //queue.add(fetchAllIssues);
	    }
		
		return resultSet;
	}
	
	private IssueModel generateIssue(Map<String,Object> issuePayload){

		List<Object> tagsArray = Arrays.asList(issuePayload.get("tags"));
		List<String> tagsList = new ArrayList<>();
		for (Object object : tagsArray) {
		    tagsList.add(Objects.toString(object, null));
		}
		
		IssueModel newissue = new IssueModel();
		newissue.setCode();
		newissue.setTags(tagsList);
		newissue.setAssignedto(issuePayload.get("assignedTo").toString());
		newissue.setAssignee(issuePayload.get("assignee").toString());
		newissue.setStatus(issuePayload.get("status") == null?"unassigned":issuePayload.get("status").toString());
		newissue.setDescription(issuePayload.get("description").toString());
		newissue.setSubject(issuePayload.get("subject").toString());
		
		return newissue;
	}
}
