package oldapi;
import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class StatCleanup extends Configured implements Tool {
	public int run(String[] args) throws Exception {
		if (args.length != 2) {
			System.err.println("Usage: StatCleanup <input path> <output path>");
			System.exit(-1);
		}
		Configuration conf = new Configuration(true);
		Job job = Job.getInstance(conf, "StatCleanup");
		job.setJarByClass(StatCleanup.class);
		job.setMapperClass(StatCleanupMapper.class);
		job.setReducerClass(StatCleanupReducer.class);
		job.setOutputKeyClass(Text.class);
		job.setOutputValueClass(DoubleWritable.class);
		FileInputFormat.addInputPath(job, new Path(args[0]));
		FileOutputFormat.setOutputPath(job, new Path(args[1]));
		return job.waitForCompletion(true) ? 0 : 1;
	}
    public static void main(String[] args) throws Exception {
        int exitCode = ToolRunner.run(new StatCleanup(), args);
        System.exit(exitCode);
    }
}
