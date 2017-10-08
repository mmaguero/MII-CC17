package oldapi;
import java.io.IOException;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapred.FileInputFormat;
import org.apache.hadoop.mapred.FileOutputFormat;
import org.apache.hadoop.mapred.JobClient;
import org.apache.hadoop.mapred.JobConf;

public class Stat {
	public static void main(String[] args) throws IOException {
		if (args.length != 4) {
			System.err.println("Usage: Stat <input path> <output path> <operation [Max Min MaxMin Avg Bal Corr Stats]> <column [0-10 | -1 for all]>");
			System.exit(-1);
		}
		if (args.length > 2) {
			if(!args[2].equals("Min") && !args[2].equals("Max") && !args[2].equals("MaxMin") && !args[2].equals("Avg") && !args[2].equals("Bal") && !args[2].equals("Corr") && !args[2].equals("Stats")){
				System.err.println("Operation [Max Min MaxMin Avg Bal Corr Stats]");
				System.exit(-1);
			}
		}
		if (args.length > 3) {
			if(Integer.parseInt(args[3])>10 || Integer.parseInt(args[3])<-1){
				System.err.println("Column number [0-10 | -1 for all]");
				System.exit(-1);
			}
			if(Integer.parseInt(args[3])<10 && args[2].equals("Bal")){
				System.err.println("Column number only 10 for Bal]");
				System.exit(-1);
			}
			if(Integer.parseInt(args[3])>-1 && args[2].equals("Corr")){
				System.err.println("Column number only -1 for Corr]");
				System.exit(-1);
			}
		}
		JobConf conf = new JobConf(Stat.class);
		conf.setJobName("Stat");
		FileInputFormat.addInputPath(conf, new Path(args[0]));
		FileOutputFormat.setOutputPath(conf, new Path(args[1]));
		if (args.length > 3) conf.set("col", args[3]);
		conf.setMapperClass(args[2].equals("Corr")?CorrMapper.class:StatMapper.class);
		conf.setReducerClass(args[2].equals("Min")?MinReducer.class:(args[2].equals("Max")?MaxReducer.class:(args[2].equals("MaxMin")?MaxMinReducer.class:(args[2].equals("Avg")?AvgReducer.class:(args[2].equals("Bal")?BalReducer.class:(args[2].equals("Stats")?StatsReducer.class:CorrReducer.class))))));
		if(args[2].equals("Corr")){
			conf.setMapOutputKeyClass(Text.class);
			conf.setMapOutputValueClass(Text.class);
		}
		conf.setOutputKeyClass(Text.class);
		conf.setOutputValueClass(DoubleWritable.class);
		JobClient.runJob(conf);
	}
}
