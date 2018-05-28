package com.example.Springgaejdohello;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;

import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

import com.example.Springgaejdohello.model.IssueModel;
import com.googlecode.objectify.ObjectifyService;

public class Bootstrapper extends SpringBootServletInitializer {


    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        //WebApplicationContext rootAppContext = createRootApplicationContext(servletContext);
        ObjectifyService.register(IssueModel.class);

}
}