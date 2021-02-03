import React from "react";
import { Formik, Form } from "formik";
import { InputField } from "../components/inputField";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Box,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { Button } from "@chakra-ui/core";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
        {({ values, handleChange, isSubmitting }) => {
          <Form>
              <InputField
                name="username"
                placeholder="username"
                label="Username"
              />
            <Box mt={4} type="submit">
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button mt={4} isLoading={isSubmitting} type="submit" variantColor="teal">Register</Button>
          </Form>;
        }}
      </Formik>
    </Wrapper>
  );
};

export default Register;
